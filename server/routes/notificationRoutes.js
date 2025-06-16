const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

router.post('/send', isAuthenticated, (req, res) => {
    const { userId, message } = req.body;
    if (!userId || !message) {
        return res.status(400).send('User ID and message are required');
    }
    // Здесь можно добавить логику отправки уведомлений (например, через email или Socket.IO)
    res.status(200).send(`Notification sent to user ${userId}: ${message}`);
});

module.exports = router;