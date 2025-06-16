const express = require('express');
const router = express.Router();
const { Service, User, Order, Settings } = require('../models');
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
        const [orders, users, services] = await Promise.all([
            Order.findAll(),
            User.findAll(),
            Service.findAll()
        ]);
        logger.info('Admin dashboard loaded', { userId: req.session.user.id });
        res.render('admin/dashboard', { orders, users, services, lang: req.getLocale(), styles: await getStyles() });
    } catch (error) {
        logger.error('Error loading admin dashboard', { error: error.message });
        res.status(500).send('Internal Server Error');
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll();
        logger.info('Admin users page loaded', { userId: req.session.user.id });
        res.render('admin/users', { users, lang: req.getLocale(), styles: await getStyles() });
    } catch (error) {
        logger.error('Error loading admin users', { error: error.message });
        res.status(500).send('Internal Server Error');
    }
});

router.get('/services', async (req, res) => {
    try {
        const services = await Service.findAll();
        logger.info('Admin services page loaded', { userId: req.session.user.id });
        res.render('admin/services', { services, lang: req.getLocale(), styles: await getStyles() });
    } catch (error) {
        logger.error('Error loading admin services', { error: error.message });
        res.status(500).send('Internal Server Error');
    }
});

router.post('/services', async (req, res) => {
    const { title, description, price, category } = req.body;
    try {
        await Service.create({ title, description, price, category, masterId: null });
        logger.info('Service created successfully', { title });
        res.redirect('/admin/services');
    } catch (error) {
        logger.error('Error creating service', { error: error.message });
        res.status(500).send('Internal Server Error');
    }
});

router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.findAll({ include: [{ model: User, as: 'Client' }, { model: User, as: 'Master' }] });
        logger.info('Admin orders page loaded', { userId: req.session.user.id });
        res.render('admin/orders', { orders, lang: req.getLocale(), styles: await getStyles() });
    } catch (error) {
        logger.error('Error loading admin orders', { error: error.message });
        res.status(500).send('Internal Server Error');
    }
});

router.get('/settings', async (req, res) => {
    try {
        const settings = await Settings.findOne() || {};
        logger.info('Admin settings page loaded', { userId: req.session.user.id });
        res.render('admin/settings', { settings, lang: req.getLocale(), styles: await getStyles() });
    } catch (error) {
        logger.error('Error loading admin settings', { error: error.message });
        res.status(500).send('Internal Server Error');
    }
});

router.post('/settings', async (req, res) => {
    const { primaryColor, secondaryColor, backgroundColor } = req.body;
    try {
        await Settings.upsert({
            primaryColor,
            secondaryColor,
            backgroundColor
        });
        logger.info('Settings updated successfully', { userId: req.session.user.id });
        res.redirect('/admin/settings');
    } catch (error) {
        logger.error('Error updating settings', { error: error.message });
        res.status(500).send('Internal Server Error');
    }
});

async function getStyles() {
    const settings = await Settings.findOne();
    return {
        primary: settings?.primaryColor || '#4361ee',
        secondary: settings?.secondaryColor || '#3f37c9',
        background: settings?.backgroundColor || '#f0f2f5'
    };
}

module.exports = router;