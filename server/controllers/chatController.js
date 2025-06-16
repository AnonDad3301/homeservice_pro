const { Message } = require('../models');

exports.sendMessage = async (req, res) => {
  const { order_id, message } = req.body;
  try {
    await Message.create({ order_id, user_id: req.user.id, message });
    res.json({ message: 'Сообщение отправлено' });
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    res.status(500).json({ message: 'Ошибка отправки сообщения' });
  }
};

exports.getChat = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { order_id: req.params.orderId },
      order: [['timestamp', 'ASC']]
    });
    res.json({ messages });
  } catch (error) {
    console.error('Ошибка при загрузке чата:', error);
    res.status(500).json({ message: 'Ошибка загрузки чата' });
  }
};