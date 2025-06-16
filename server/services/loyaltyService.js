const { LoyaltyProgram, LoyaltyTransaction, Order } = require('../models');

module.exports = {
  calculatePoints: async (orderId) => {
    const order = await Order.findByPk(orderId, {
      include: [Service]
    });
    
    if (!order) {
      throw new Error('Заказ не найден');
    }
    
    // Базное начисление: 1 балл за каждые 100 рублей
    let points = Math.floor(order.totalAmount / 100);
    
    // Бонус за первую услугу
    const userOrderCount = await Order.count({ 
      where: { userId: order.userId } 
    });
    
    if (userOrderCount === 1) {
      points += 50; // +50 баллов за первый заказ
    }
    
    // Бонус за определенные категории услуг
    const isPremium = order.services.some(s => s.categoryId === 'premium');
    if (isPremium) {
      points *= 1.5; // +50% баллов
    }
    
    // Сезонные акции и промо
    const now = new Date();
    if (now.getMonth() === 11) { // Декабрь
      points *= 2; // Двойные баллы в декабре
    }
    
    return points;
  },
  
  addPoints: async (userId, points, reason) => {
    const program = await LoyaltyProgram.findOne({
      where: { userId }
    });
    
    if (!program) {
      await LoyaltyProgram.create({
        userId,
        totalPoints: points,
        currentPoints: points
      });
    } else {
      program.totalPoints += points;
      program.currentPoints += points;
      await program.save();
    }
    
    await LoyaltyTransaction.create({
      userId,
      points,
      type: 'earn',
      reason
    });
  },
  
  redeemPoints: async (userId, points, serviceId) => {
    const program = await LoyaltyProgram.findOne({
      where: { userId }
    });
    
    if (!program || program.currentPoints < points) {
      throw new Error('Недостаточно баллов');
    }
    
    program.currentPoints -= points;
    await program.save();
    
    await LoyaltyTransaction.create({
      userId,
      points: -points,
      type: 'redeem',
      reason: `Оплата услуги #${serviceId}`
    });
    
    return program;
  },
  
  getUserLoyaltyStatus: async (userId) => {
    const program = await LoyaltyProgram.findOne({
      where: { userId }
    });
    
    if (!program) {
      return {
        status: 'Новичок',
        currentPoints: 0,
        totalPoints: 0,
        nextStatus: 'Серебро',
        pointsToNext: 500
      };
    }
    
    // Определение статуса
    let status, nextStatus, pointsToNext;
    
    if (program.totalPoints >= 2000) {
      status = 'Золото';
      nextStatus = null;
      pointsToNext = 0;
    } else if (program.totalPoints >= 500) {
      status = 'Серебро';
      nextStatus = 'Золото';
      pointsToNext = 2000 - program.totalPoints;
    } else {
      status = 'Базовый';
      nextStatus = 'Серебро';
      pointsToNext = 500 - program.totalPoints;
    }
    
    return {
      status,
      currentPoints: program.currentPoints,
      totalPoints: program.totalPoints,
      nextStatus,
      pointsToNext
    };
  }
};