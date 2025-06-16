const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

router.get('/room/:orderId', isAuthenticated, (req, res) => {
    const orderId = req.params.orderId;
    res.render('chat/room', { orderId, lang: req.getLocale(), user: req.session.user });
});

module.exports = router;