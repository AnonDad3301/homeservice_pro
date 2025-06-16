const express = require('express');
const router = express.Router();
const { Service, Order } = require('../models');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'server/logs/app.log' }),
        new winston.transports.Console()
    ]
});

router.get('/dashboard', async (req, res) => {
    try {
        const [services, orders] = await Promise.all([
            Service.findAll({ where: { masterId: req.session.user.id } }),
            Order.findAll({ where: { masterId: null } }) // Только незанятые заказы
        ]);
        logger.info('Master dashboard loaded', { userId: req.session.user.id });
        res.render('master/dashboard', { 
            services, 
            orders, 
            user: req.session.user, 
            lang: req.getLocale(), 
            styles: await getStyles() 
        });
    } catch (error) {
        logger.error('Error loading master dashboard', { error: error.message });
        res.status(500).send('Internal Server Error');
    }
});

router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.findAll({ where: { masterId: req.session.user.id } });
        logger.info('Master orders page loaded', { userId: req.session.user.id });
        res.render('master/orders', { orders, lang: req.getLocale(), styles: await getStyles() });
    } catch (error) {
        logger.error('Error loading master orders', { error: error.message });
        res.status(500).send('Internal Server Error');
    }
});

router.post('/orders/:id/accept', async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findByPk(id);
        if (order && !order.masterId) {
            order.masterId = req.session.user.id;
            order.status = 'in_progress';
            await order.save();
            logger.info('Order accepted by master', { userId: req.session.user.id, orderId: id });
            res.redirect('/master/orders');
        } else {
            logger.warn('Order not available for acceptance', { orderId: id });
            res.status(400).send('Заказ недоступен');
        }
    } catch (error) {
        logger.error('Error accepting order', { error: error.message });
        res.status(500).send('Internal Server Error');
    }
});

router.get('/payments', async (req, res) => {
    logger.info('Master payments page loaded', { userId: req.session.user.id });
    res.render('master/payments', { lang: req.getLocale(), styles: await getStyles() });
});

router.get('/profile', async (req, res) => {
    logger.info('Master profile page loaded', { userId: req.session.user.id });
    res.render('master/profile', { user: req.session.user, lang: req.getLocale(), styles: await getStyles() });
});

router.get('/services/create', async (req, res) => {
    logger.info('Master service creation page loaded', { userId: req.session.user.id });
    res.render('master/create-service', { lang: req.getLocale(), styles: await getStyles() });
});

router.post('/services/create', async (req, res) => {
    const { title, description, price, category } = req.body;
    try {
        await Service.create({ title, description, price, category, masterId: req.session.user.id });
        logger.info('Service created by master', { userId: req.session.user.id, title });
        res.redirect('/master/dashboard');
    } catch (error) {
        logger.error('Error creating service by master', { error: error.message });
        res.status(500).send('Internal Server Error');
    }
});

async function getStyles() {
    const { Settings } = require('../models');
    const settings = await Settings.findOne();
    return {
        primary: settings?.primaryColor || '#4361ee',
        secondary: settings?.secondaryColor || '#3f37c9',
        background: settings?.backgroundColor || '#f0f2f5'
    };
}

module.exports = router;