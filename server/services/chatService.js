const WebSocket = require('ws');
const { Chat } = require('../models');

class ChatService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map();
    
    this.wss.on('connection', (ws, req) => {
      // Аутентификация по токену
      const token = req.url.split('token=')[1];
      if (!token) {
        ws.close();
        return;
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        this.clients.set(decoded.id, ws);
        
        ws.on('message', (message) => this.handleMessage(decoded.id, message));
        ws.on('close', () => this.clients.delete(decoded.id));
      } catch (error) {
        ws.close();
      }
    });
  }
  
  async handleMessage(senderId, rawMessage) {
    try {
      const message = JSON.parse(rawMessage);
      const { orderId, recipientId, content } = message;
      
      // Сохранение сообщения в БД
      const chatMessage = await Chat.create({
        orderId,
        senderId,
        recipientId,
        content,
        timestamp: new Date()
      });
      
      // Отправка получателю, если онлайн
      const recipientWs = this.clients.get(recipientId);
      if (recipientWs) {
        recipientWs.send(JSON.stringify({
          type: 'message',
          data: chatMessage
        }));
      }
      
      // Отправка в Telegram, если настроено
      const recipient = await User.findByPk(recipientId);
      if (recipient.telegramChatId) {
        await sendTelegramMessage(
          recipient.telegramChatId,
          `Новое сообщение по заказу #${orderId}: ${content}`
        );
      }
    } catch (error) {
      console.error('Ошибка обработки сообщения:', error);
    }
  }
  
  sendNotification(userId, notification) {
    const ws = this.clients.get(userId);
    if (ws) {
      ws.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));
    }
  }
}

module.exports = ChatService;