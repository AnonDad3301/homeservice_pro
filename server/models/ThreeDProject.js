const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ThreeDProject = sequelize.define('ThreeDProject', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    modelUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
    },
    material: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dimensions: {
        type: DataTypes.JSON,
        allowNull: true,
    },
});

module.exports = ThreeDProject;