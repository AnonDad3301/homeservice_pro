const axios = require('axios');
const { Payment, Order } = require('../models');

const TINKOFF_API_URL = 'https://securepay.tinkoff.ru/v2';

module.exports = {
  initPayment: async (orderId, amount, userId) => {
    try {
      const response = await axios.post(`${TINKOFF_API_URL}/Init`, {
        TerminalKey: process.env.TINKOFF_TERMINAL_KEY,
        OrderId: orderId.toString(),
        Amount: amount * 100, // в копейках
        CustomerKey: userId,
        SuccessURL: `${process.env.BASE_URL}/payment/success`,
        FailURL: `${process.env.BASE_URL}/payment/fail`,
        NotificationURL: `${process.env.BASE_URL}/api/payment/webhook`,
        Description: `Оплата заказа #${orderId}`
      });
      
      // Сохраняем платеж в БД
      const payment = await Payment.create({
        orderId,
        userId,
        amount,
        status: 'pending',
        paymentId: response.data.PaymentId
      });
      
      return response.data;
    } catch (error) {
      console.error('Ошибка инициализации платежа:', error.response.data);
      throw error;
    }
  },
  
  handleWebhook: async (data) => {
    try {
      // Проверка подписи
      const crypto = require('crypto');
      const values = Object.keys(data)
        .filter(key => key !== 'Token')
        .sort()
        .map(key => data[key])
        .join('');
      
      const token = crypto
        .createHash('sha256')
        .update(values + process.env.TINKOFF_TERMINAL_PASSWORD)
        .digest('hex');
      
      if (token !== data.Token) {
        throw new Error('Неверная подпись уведомления');
      }
      
      // Обновление статуса платежа
      const payment = await Payment.findOne({ 
        where: { paymentId: data.PaymentId }
      });
      
      if (payment) {
        payment.status = data.Status.toLowerCase();
        await payment.save();
        
        // Обновление статуса заказа
        if (data.Status === 'CONFIRMED') {
          const order = await Order.findByPk(payment.orderId);
          order.status = 'paid';
          await order.save();
          
          // Уведомление клиенту и мастеру
          notifyUser(order.userId, `Оплата заказа #${order.id} подтверждена`);
          notifyUser(order.masterId, `Заказ #${order.id} оплачен`);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Ошибка обработки webhook:', error);
      throw error;
    }
  }
};