const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    serviceId: { type: DataTypes.INTEGER, allowNull: false },
    clientId: { type: DataTypes.INTEGER, allowNull: false },
    masterId: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.ENUM('new', 'in_progress', 'completed', 'paid', 'canceled'), defaultValue: 'new' },
    description: { type: DataTypes.TEXT, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: false },
    dateTime: { type: DataTypes.DATE, allowNull: false },
    total: { type: DataTypes.FLOAT, allowNull: true },
}, { tableName: 'Orders' });

module.exports = Order;