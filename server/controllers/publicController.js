const { Service } = require('../models');

exports.getServices = async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка сервера');
  }
};

exports.submitRequest = async (req, res) => {
  try {
    // Логика обработки заявки
    res.json({ message: 'Заявка принята' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка сервера');
  }
};