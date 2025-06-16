const { User, Service, Order } = require('../models');

exports.getDashboard = async (req, res) => {
    try {
        const orders = await Order.findAll();
        const users = await User.findAll();
        const services = await Service.findAll();
        res.render('admin/dashboard', { orders, users, services, lang: req.getLocale(), user: req.session.user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id, role } = req.body;
        await User.update({ role }, { where: { id } });
        res.redirect('/admin/users');
    } catch (error) {
        res.status(500).send(error.message);
    }
};