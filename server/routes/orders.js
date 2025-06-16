const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, adminAuth } = require('../middlewares/auth');
const { Op } = require('sequelize');

// Получение заказов для клиента
router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.user.id },
            include: ['service', 'master'],
            order: [['createdAt', 'DESC']]
        });
        
        res.json(orders.map(order => ({
            id: order.id,
            serviceName: order.service.name,
            serviceIcon: order.service.icon,
            address: order.address,
            scheduledDate: order.scheduledDate,
            master: order.master ? `${order.master.firstName} ${order.master.lastName}` : null,
            status: order.status,
            price: order.price
        })));
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение заказов поблизости для мастера
router.get('/nearby', auth, async (req, res) => {
    try {
        const { lat, lng, radius = 5 } = req.query;
        
        const orders = await Order.findAll({
            where: {
                status: 'pending',
                [Op.and]: [
                    Order.sequelize.literal(`
                        ST_Distance(
                            ST_GeomFromText('POINT(${lng} ${lat})', 4326),
                            coordinates
                        ) <= ${radius * 1000}
                    `)
                ]
            },
            include: ['service', 'user'],
            order: [['createdAt', 'ASC']]
        });
        
        res.json(orders.map(order => ({
            id: order.id,
            service: order.service.name,
            address: order.address,
            price: order.price,
            latitude: order.coordinates.coordinates[1],
            longitude: order.coordinates.coordinates[0],
            clientName: `${order.user.firstName} ${order.user.lastName}`
        })));
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Назначение мастера на заказ
router.post('/:id/assign', auth, async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        
        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }
        
        if (order.status !== 'pending') {
            return res.status(400).json({ error: 'Заказ уже назначен' });
        }
        
        // Проверка, что пользователь - мастер
        if (req.user.role !== 'master') {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }
        
        // Обновление заказа
        order.masterId = req.user.id;
        order.status = 'assigned';
        await order.save();
        
        // Отправка уведомлений
        sendNotification(order.userId, 'Ваш заказ принят мастером');
        sendNotification(req.user.id, 'Вы назначены на заказ');
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Админ: получение всех заказов
router.get('/admin/orders', adminAuth, async (req, res) => {
    try {
        const { status, dateFrom, dateTo, service } = req.query;
        
        const where = {};
        if (status && status !== 'all') where.status = status;
        if (service && service !== 'all') where.serviceId = service;
        
        if (dateFrom && dateTo) {
            where.scheduledDate = {
                [Op.between]: [new Date(dateFrom), new Date(dateTo)]
            };
        }
        
        const orders = await Order.findAll({
            where,
            include: ['service', 'user', 'master'],
            order: [['scheduledDate', 'DESC']],
            limit: 50
        });
        
        res.json(orders.map(order => ({
            id: order.id,
            service: order.service.name,
            client: `${order.user.firstName} ${order.user.lastName}`,
            address: order.address,
            datetime: order.scheduledDate,
            master: order.master ? `${order.master.firstName} ${order.master.lastName}` : null,
            status: order.status,
            price: order.price
        })));
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});