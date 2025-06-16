const { Notification } = require('../models');

exports.sendNotification = async (req, res) => {
  const { user_id, message } = req.body;
  try {
    await Notification.create({ user_id, message });
    res.json({ message: 'Уведомление отправлено' });
  } catch (error) {
    console.error('Ошибка при отправке уведомления:', error);
    res.status(500).json({ message: 'Ошибка отправки уведомления' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({ where: { user_id: req.user.id } });
    res.json(notifications);
  } catch (error) {
    console.error('Ошибка при загрузке уведомлений:', error);
    res.status(500).json({ message: 'Ошибка загрузки уведомлений' });
  }
};