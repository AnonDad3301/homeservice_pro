const { Order, Service, User } = require('../models');

exports.getDashboard = async (req, res) => {
  try {
    res.send('Личный кабинет клиента');
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка сервера');
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [Service]
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка сервера');
  }
};

exports.createOrder = async (req, res) => {
  try {
    // Логика создания заказа
    res.status(201).json({ message: 'Заказ создан' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка сервера');
  }
};