const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  order_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  address_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  tax: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'GST for India, 0 for international',
  },
  cgst: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  sgst: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  igst: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  shipping_charge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.ENUM('INR', 'USD'),
    allowNull: false,
  },
  coupon_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  coupon_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  order_status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'),
    defaultValue: 'pending',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'orders',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['order_number'], unique: true },
    { fields: ['payment_status'] },
    { fields: ['order_status'] },
    { fields: ['created_at'] },
  ],
});

module.exports = Order;
