const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

router.post('/create', isAuthenticated, (req, res) => {
    const { orderId, amount } = req.body;
    if (!orderId || !amount) {
        return res.status(400).send('Order ID and amount are required');
    }
    // Здесь можно добавить логику обработки платежа
    res.status(200).send(`Payment for order ${orderId} of ${amount} RUB processed successfully`);
});

module.exports = router;