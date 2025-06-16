const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite://' + path.join(__dirname, '../database.sqlite'));

const User = sequelize.define('User', {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('admin', 'master', 'client'), allowNull: false }
});

const Service = sequelize.define('Service', {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    masterId: { type: DataTypes.INTEGER, references: { model: User, key: 'id' } }
});

const Order = sequelize.define('Order', {
    serviceTitle: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('new', 'in_progress', 'completed'), defaultValue: 'new' },
    clientId: { type: DataTypes.INTEGER, references: { model: User, key: 'id' } },
    masterId: { type: DataTypes.INTEGER, references: { model: User, key: 'id' } }
});

const Settings = sequelize.define('Settings', {
    primaryColor: { type: DataTypes.STRING, defaultValue: '#4361ee' },
    secondaryColor: { type: DataTypes.STRING, defaultValue: '#3f37c9' },
    backgroundColor: { type: DataTypes.STRING, defaultValue: '#f0f2f5' }
});

const Payment = sequelize.define('Payment', {
    amount: { type: DataTypes.FLOAT, allowNull: false },
    clientId: { type: DataTypes.INTEGER, references: { model: 'Users', key: 'id' } },
    orderId: { type: DataTypes.INTEGER, references: { model: 'Orders', key: 'id' } },
    status: { type: DataTypes.ENUM('pending', 'completed', 'failed'), defaultValue: 'pending' },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

User.hasMany(Service, { foreignKey: 'masterId' });
User.hasMany(Order, { foreignKey: 'clientId', as: 'Client' });
User.hasMany(Order, { foreignKey: 'masterId', as: 'Master' });
Service.hasMany(Order, { foreignKey: 'serviceId' });
User.hasMany(Payment, { foreignKey: 'clientId' });
Order.hasMany(Payment, { foreignKey: 'orderId' });

module.exports = { sequelize, User, Service, Order, Settings, Payment };