const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  discount_type: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false,
    comment: 'If fixed then discount_value is fixed amount, if percentage then discount_value is percentage',
  },
  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'If fixed then discount_value is fixed amount, if percentage then discount_value is percentage',
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'If set, coupon only applies to this brand',
  },
  starts_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  usage_limit: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment: 'Max total usages, null = unlimited',
  },
  used_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'coupons',
  indexes: [
    { fields: ['code'], unique: true },
    { fields: ['brand'] },
    { fields: ['is_active'] },
  ],
});

module.exports = Coupon;
