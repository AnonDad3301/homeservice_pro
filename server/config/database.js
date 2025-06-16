const { Sequelize } = require('sequelize');

// Жестко задаем конфигурацию базы данных
const DATABASE_URL = 'sqlite://./database.sqlite';

console.log('DATABASE_URL in database.js:', DATABASE_URL); // Отладка

const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'sqlite',
    logging: false,
});

module.exports = sequelize;