const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// Маршруты личного кабинета клиента
router.get('/dashboard', clientController.getDashboard);
router.get('/orders', clientController.getOrders);
router.post('/orders', clientController.createOrder);

module.exports = router; // Экспорт роутера