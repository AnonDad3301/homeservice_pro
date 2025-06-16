const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Master = sequelize.define('Master', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    specialization: {
        type: DataTypes.JSON, // Список категорий услуг
        defaultValue: [],
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    zones: {
        type: DataTypes.JSON, // Зоны работы в Сочи
        defaultValue: [],
    },
    isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
});

module.exports = Master;