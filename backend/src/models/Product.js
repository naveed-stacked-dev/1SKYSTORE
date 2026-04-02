const { DataTypes } = require('sequelize');
const slugify = require('slugify');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(300),
    allowNull: false,
    unique: true,
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  short_description: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  price_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  price_inr: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  compare_at_price_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Original price for showing discounts',
  },
  compare_at_price_inr: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  stock: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  low_stock_threshold: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 5,
  },
  weight: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    comment: 'Weight in grams for shipping calculation',
  },
  dimensions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '{ length, width, height } in cm',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_best: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Admin-flagged best seller for dashboard',
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Admin-flagged featured product for hero grid',
  },
  meta_title: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  meta_description: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of tag strings',
  },
  hsn_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'HSN code for GST',
  },
  gst_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 18.00,
    comment: 'GST rate for India',
  },
}, {
  tableName: 'products',
  indexes: [
    { fields: ['sku'], unique: true },
    { fields: ['slug'], unique: true },
    { fields: ['category'] },
    { fields: ['brand'] },
    { fields: ['is_active'] },
    { fields: ['price_usd'] },
    { fields: ['price_inr'] },
  ],
});

// Auto-generate slug from name before validation to satisfy non-null constraint
Product.beforeValidate(async (product, options) => {
  if (!product.slug && product.name) {
    let baseSlug = slugify(product.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ where: { slug }, transaction: options.transaction, paranoid: false })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    product.slug = slug;
  }
});

module.exports = Product;
