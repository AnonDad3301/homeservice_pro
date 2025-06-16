const express = require('express');
const router = express.Router();
const { Order, Service, Payment } = require('../models');
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
        const orders = await Order.findAll({ where: { clientId: req.session.user.id } });
        const payments = await Payment.findAll({ where: { clientId: req.session.user.id } });
        const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        logger.info('Client dashboard loaded', { userId: req.session.user.id });
        res.render('client/dashboard', { 
            orders, 
            user: req.session.user, 
            payments: { total: totalPayments }, 
            lang: req.getLocale(), 
            styles: await getStyles() 
        });
    } catch (error) {
        logger.error('Error loading client dashboard', { error: error.message });
        res.status(500).send('Internal Server Error');
    }
});

router.get('/orders/create', async (req, res) => {
    try {
        const services = await Service.findAll();
        logger.info('Client order creation page loaded', { userId: req.session.user.id });
        res.render('client/create-order', { services, lang: req.getLocale(), styles: await getStyles() });
    } catch (error) {
        logger.error('Error loading order creation page', { error: error.message });
        res.status(500).send('Internal Server Error');
    }
});

router.post('/orders/create', async (req, res) => {
    const { serviceId } = req.body;
    try {
        const service = await Service.findByPk(serviceId);
        if (service) {
            await Order.create({
                serviceTitle: service.title,
                status: 'new',
                clientId: req.session.user.id,
                masterId: null
            });
            logger.info('Order created by client', { userId: req.session.user.id, serviceId });
            res.redirect('/client/dashboard');
        } else {
            logger.warn('Service not found', { serviceId });
            res.status(400).send('Услуга не найдена');
        }
    } catch (error) {
        logger.error('Error creating order', { error: error.message });
        res.status(500).send('Internal Server Error');
    }
});

router.get('/profile', async (req, res) => {
    logger.info('Client profile page loaded', { userId: req.session.user.id });
    res.render('client/profile', { user: req.session.user, lang: req.getLocale(), styles: await getStyles() });
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