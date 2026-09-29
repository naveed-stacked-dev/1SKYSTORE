const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('hero', 'info'),
    allowNull: false,
    defaultValue: 'hero',
  },
  device_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'desktop',
  },
  image_url: {
    type: DataTypes.STRING(1000),
    allowNull: false,
  },
  link: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'banners',
  timestamps: true,
});

module.exports = Banner;
