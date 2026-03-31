const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductImage = sequelize.define('ProductImage', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING(1000),
    allowNull: false,
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sort_order: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  alt_text: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'product_images',
  indexes: [
    { fields: ['product_id'] },
  ],
});

module.exports = ProductImage;
