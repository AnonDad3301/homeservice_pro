const { Order, Service } = require('../models');

exports.createOrder = async (req, res) => {
    try {
        const { serviceId, description, address, dateTime } = req.body;
        const service = await Service.findByPk(serviceId);
        const order = await Order.create({
            serviceId,
            clientId: req.session.user.id,
            description,
            address,
            dateTime,
            total: service.price,
        });
        res.redirect('/orders');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getOrders = async (req, res) => {
    try {
        const { Order } = require('../models');
        const orders = await Order.findAll({ where: { clientId: req.session.user.id } });
        res.render('orders', { orders, lang: req.getLocale(), user: req.session.user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getMasterOrders = async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'master') {
            return res.status(403).send('Доступ только для мастеров');
        }
        const { Order } = require('../models');
        const orders = await Order.findAll({ where: { masterId: req.session.user.id } });
        res.render('master/orders', { orders, lang: req.getLocale(), user: req.session.user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};