const axios = require('axios');

module.exports = {
  sendTelegramMessage: async (chatId, text) => {
    try {
      await axios.post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: chatId,
          text,
          parse_mode: 'HTML'
        }
      );
    } catch (error) {
      console.error('Ошибка отправки в Telegram:', error.response?.data);
    }
  },
  
  setupWebhook: async () => {
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`,
        {
          url: `${process.env.BASE_URL}/api/telegram/webhook`
        }
      );
      console.log('Telegram webhook настроен:', response.data);
    } catch (error) {
      console.error('Ошибка настройки webhook Telegram:', error);
    }
  },
  
  handleTelegramUpdate: async (update) => {
    try {
      const message = update.message;
      if (!message) return;
      
      const text = message.text;
      const chatId = message.chat.id;
      
      // Обработка команд
      if (text === '/start') {
        await sendTelegramMessage(
          chatId,
          'Добро пожаловать! Отправьте код подтверждения из приложения.'
        );
      } else if (/^\d{6}$/.test(text)) {
        // Связывание аккаунта
        const user = await User.findOne({ where: { telegramVerificationCode: text } });
        if (user) {
          await user.update({ 
            telegramChatId: chatId,
            telegramVerificationCode: null
          });
          await sendTelegramMessage(
            chatId,
            'Ваш аккаунт успешно привязан! Вы будете получать уведомления здесь.'
          );
        } else {
          await sendTelegramMessage(
            chatId,
            'Неверный код. Пожалуйста, проверьте и попробуйте снова.'
          );
        }
      }
    } catch (error) {
      console.error('Ошибка обработки Telegram обновления:', error);
    }
  }
};