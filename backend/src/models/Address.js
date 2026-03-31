const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  label: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'e.g. Home, Office, etc.',
  },
  full_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  phone_enc: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'AES-256 encrypted phone number',
  },
  address_line1: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  address_line2: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'India',
  },
  postal_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'addresses',
  indexes: [
    { fields: ['user_id'] },
  ],
});

module.exports = Address;
