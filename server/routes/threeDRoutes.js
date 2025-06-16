const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

router.post('/order', isAuthenticated, (req, res) => {
    const { modelDescription, material } = req.body;
    if (!modelDescription || !material) {
        return res.status(400).send('Model description and material are required');
    }
    // Здесь можно добавить логику обработки заказа 3D-печати
    res.status(200).send(`3D print order placed: ${modelDescription} with ${material}`);
});

module.exports = router;