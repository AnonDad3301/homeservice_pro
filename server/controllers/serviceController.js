const { Service } = require('../models');

exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.findAll();
        res.render('services', { services, lang: req.getLocale(), user: req.session.user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getMasterServices = async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'master') {
            return res.status(403).send('Доступ только для мастеров');
        }
        const services = await Service.findAll({ where: { masterId: req.session.user.id } });
        res.render('master/services', { services, lang: req.getLocale(), user: req.session.user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.createService = async (req, res) => {
    try {
        if (req.session.user.role !== 'master') {
            return res.status(403).send('Только мастера могут создавать услуги');
        }
        const { title, description, price, category, icon } = req.body;
        await Service.create({ title, description, price, category, icon, masterId: req.session.user.id });
        res.redirect('/master/dashboard');
    } catch (error) {
        res.status(500).send(error.message);
    }
};