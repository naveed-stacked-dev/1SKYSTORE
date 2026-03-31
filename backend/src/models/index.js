const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const Admin = require('./Admin');
const RefreshToken = require('./RefreshToken');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Address = require('./Address');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');
const Coupon = require('./Coupon');
const Shipment = require('./Shipment');
const Blog = require('./Blog');
const ImportLog = require('./ImportLog');

// ─── ASSOCIATIONS ────────────────────────────────────────────────────────────

// User associations
User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(Cart, { foreignKey: 'user_id', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Admin associations
Admin.hasMany(RefreshToken, { foreignKey: 'admin_id', as: 'refreshTokens' });
RefreshToken.belongsTo(Admin, { foreignKey: 'admin_id', as: 'admin' });

Admin.hasMany(Blog, { foreignKey: 'author_admin_id', as: 'blogs' });
Blog.belongsTo(Admin, { foreignKey: 'author_admin_id', as: 'author' });

Admin.hasMany(ImportLog, { foreignKey: 'admin_id', as: 'importLogs' });
ImportLog.belongsTo(Admin, { foreignKey: 'admin_id', as: 'admin' });

// Product associations
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Cart associations
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });

// Order associations
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Order.hasMany(Payment, { foreignKey: 'order_id', as: 'payments' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Order.hasOne(Shipment, { foreignKey: 'order_id', as: 'shipment' });
Shipment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Order.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });

Order.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' });

module.exports = {
  sequelize,
  User,
  Admin,
  RefreshToken,
  Product,
  ProductImage,
  Cart,
  CartItem,
  Address,
  Order,
  OrderItem,
  Payment,
  Coupon,
  Shipment,
  Blog,
  ImportLog,
};
