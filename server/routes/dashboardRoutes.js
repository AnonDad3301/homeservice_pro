const express = require('express');
const router = express.Router();
const { isAuthenticated, isRole } = require('../middleware/auth');
const { User, Service } = require('../models');

router.get('/', isAuthenticated, async (req, res) => {
    const user = req.session.user;
    try {
        if (user.role === 'client') {
            const services = await Service.findAll();
            res.render('dashboard/client', { user, services, lang: req.getLocale() });
        } else if (user.role === 'master') {
            const services = await Service.findAll({ where: { masterId: user.id } });
            res.render('dashboard/master', { user, services, lang: req.getLocale() });
        } else if (user.role === 'admin') {
            const users = await User.findAll();
            const services = await Service.findAll();
            res.render('dashboard/admin', { user, users, services, lang: req.getLocale() });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;