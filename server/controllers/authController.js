const bcrypt = require('bcryptjs');
const { User } = require('../models');

exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, role, city } = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).render('register', { error: 'Email уже занят', lang: req.getLocale() });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, phone, password: hashedPassword, role, city });
        req.session.user = user;
        res.redirect(`/${role}/dashboard`);
    } catch (error) {
        res.status(500).render('register', { error: error.message, lang: req.getLocale() });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).render('login', { error: 'Неверные данные', lang: req.getLocale() });
        }
        req.session.user = user;
        res.redirect(`/${user.role}/dashboard`);
    } catch (error) {
        res.status(500).render('login', { error: error.message, lang: req.getLocale() });
    }
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};