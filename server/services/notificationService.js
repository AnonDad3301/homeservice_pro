const webpush = require('web-push');
const { Notification } = require('../models');
const smsService = require('./smsService');
const emailService = require('./emailService');

// Конфигурация Web Push
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

module.exports = {
  notifyUser: async (userId, message, data = {}) => {
    try {
      // Сохраняем уведомление в БД
      const notification = await Notification.create({
        userId,
        message,
        data: JSON.stringify(data),
        read: false
      });
      
      // Здесь должна быть логика получения пользователя и его настроек
      // Временно просто логируем
      console.log(`Notification sent to user ${userId}: ${message}`);
      
      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  },
  
  sendVerificationCode: async (phone) => {
    const code = Math.floor(1000 + Math.random() * 9000); // 4-значный код
    await smsService.sendSms(phone, `Ваш код подтверждения: ${code}`);
    return code;
  }
};