const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
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

router.get('/register', (req, res) => {
    logger.info('Accessed registration page');
    res.render('register', { error: null, lang: req.getLocale(), styles: {} });
});
router.get('/login', (req, res) => {
    logger.info('Accessed login page');
    res.render('login', { error: null, lang: req.getLocale(), styles: {} });
});

router.post('/register', async (req, res) => {
    logger.info('Registration attempt', { data: req.body });
    const { firstName, lastName, email, password, confirmPassword, phone, city, role } = req.body;
    if (password !== confirmPassword) {
        logger.warn('Password mismatch during registration');
        return res.render('register', { error: 'Пароли не совпадают', lang: req.getLocale(), styles: {} });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ firstName, lastName, email, password: hashedPassword, phone, city, role });
        req.session.user = user;
        logger.info('User registered successfully', { userId: user.id, email: user.email, role: user.role });
        res.redirect(user.role === 'admin' ? '/admin/dashboard' : user.role === 'master' ? '/master/dashboard' : '/client/dashboard');
    } catch (error) {
        logger.error('Registration error', { error: error.message });
        res.render('register', { error: 'Ошибка регистрации', lang: req.getLocale(), styles: {} });
    }
});

router.post('/login', async (req, res) => {
    logger.info('Login attempt', { email: req.body.email });
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = user;
            logger.info('Login successful', { userId: user.id, email: user.email, role: user.role });
            res.redirect(user.role === 'admin' ? '/admin/dashboard' : user.role === 'master' ? '/master/dashboard' : '/client/dashboard');
        } else {
            logger.warn('Invalid login attempt', { email: email });
            res.render('login', { error: 'Неверные данные', lang: req.getLocale(), styles: {} });
        }
    } catch (error) {
        logger.error('Login error', { error: error.message });
        res.render('login', { error: 'Ошибка входа', lang: req.getLocale(), styles: {} });
    }
});

router.get('/logout', (req, res) => {
    logger.info('User logged out', { userId: req.session.user?.id });
    req.session.destroy();
    res.redirect('/');
});

(async () => {
    try {
        const adminCount = await User.count({ where: { role: 'admin' } });
        if (adminCount === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                firstName: 'Admin',
                lastName: 'Admin',
                email: 'admin@homeservicepro.com',
                password: hashedPassword,
                phone: '+79991234567',
                city: 'Сочи',
                role: 'admin'
            });
            logger.info('Admin user auto-registered', { email: 'admin@homeservicepro.com' });
        }
    } catch (error) {
        logger.error('Error auto-registering admin', { error: error.message });
    }
})();

module.exports = router;