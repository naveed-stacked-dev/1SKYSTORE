const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  provider: {
    type: DataTypes.ENUM('stripe', 'razorpay'),
    allowNull: false,
  },
  provider_payment_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Stripe PaymentIntent ID or Razorpay Payment ID',
  },
  provider_order_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Razorpay Order ID or Stripe Session ID',
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.ENUM('INR', 'USD'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('created', 'authorized', 'captured', 'failed', 'refunded'),
    defaultValue: 'created',
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'e.g. card, upi, netbanking',
  },
  raw_response: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Full response from payment provider',
  },
}, {
  tableName: 'payments',
  indexes: [
    { fields: ['order_id'] },
    { fields: ['provider_payment_id'] },
    { fields: ['status'] },
  ],
});

module.exports = Payment;
