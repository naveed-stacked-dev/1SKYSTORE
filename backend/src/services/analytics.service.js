const { Op, fn, col, literal } = require('sequelize');
const { Order, OrderItem, User, Product, sequelize } = require('../models');

/**
 * Get sales analytics with period filtering
 * @param {'daily'|'monthly'|'yearly'} period
 */
async function getSalesAnalytics(period = 'monthly', from, to) {
  let dateFormat;
  switch (period) {
    case 'daily': dateFormat = '%Y-%m-%d'; break;
    case 'yearly': dateFormat = '%Y'; break;
    default: dateFormat = '%Y-%m'; break;
  }

  const where = { payment_status: 'paid' };
  if (from) where.created_at = { ...where.created_at, [Op.gte]: new Date(from) };
  if (to) where.created_at = { ...where.created_at, [Op.lte]: new Date(to) };

  const sales = await Order.findAll({
    attributes: [
      [fn('DATE_FORMAT', col('Order.created_at'), dateFormat), 'period'],
      [fn('COUNT', col('Order.id')), 'total_orders'],
      [fn('SUM', col('total_amount')), 'total_revenue'],
      [fn('AVG', col('total_amount')), 'avg_order_value'],
    ],
    where,
    group: [literal(`DATE_FORMAT(\`Order\`.\`created_at\`, '${dateFormat}')`)],
    order: [[literal(`DATE_FORMAT(\`Order\`.\`created_at\`, '${dateFormat}')`), 'DESC']],
    raw: true,
  });

  return sales;
}

/**
 * Get revenue split by currency (INR vs USD)
 */
async function getRevenueSplit(from, to) {
  const where = { payment_status: 'paid' };
  if (from) where.created_at = { ...where.created_at, [Op.gte]: new Date(from) };
  if (to) where.created_at = { ...where.created_at, [Op.lte]: new Date(to) };

  const split = await Order.findAll({
    attributes: [
      'currency',
      [fn('COUNT', col('id')), 'total_orders'],
      [fn('SUM', col('total_amount')), 'total_revenue'],
    ],
    where,
    group: ['currency'],
    raw: true,
  });

  return split;
}

/**
 * Get top selling products
 */
async function getTopProducts(limit = 10) {
  const products = await OrderItem.findAll({
    attributes: [
      'product_id',
      'product_name',
      [fn('SUM', col('quantity')), 'total_sold'],
      [fn('SUM', col('total_price')), 'total_revenue'],
    ],
    include: [{
      model: Order,
      as: 'order',
      attributes: [],
      where: { payment_status: 'paid' },
    }],
    group: ['product_id', 'product_name'],
    order: [[literal('total_sold'), 'DESC']],
    limit,
    raw: true,
  });

  return products;
}

/**
 * Get top brands by revenue
 */
async function getTopBrands(limit = 10) {
  const brands = await OrderItem.findAll({
    attributes: [
      [col('product.brand'), 'brand'],
      [fn('SUM', col('OrderItem.quantity')), 'total_sold'],
      [fn('SUM', col('OrderItem.total_price')), 'total_revenue'],
    ],
    include: [
      {
        model: Order,
        as: 'order',
        attributes: [],
        where: { payment_status: 'paid' },
      },
      {
        model: Product,
        as: 'product',
        attributes: [],
      },
    ],
    group: [col('product.brand')],
    having: literal('brand IS NOT NULL'),
    order: [[literal('total_revenue'), 'DESC']],
    limit,
    raw: true,
  });

  return brands;
}

/**
 * Get user growth analytics
 */
async function getUserGrowth(period = 'monthly') {
  let dateFormat;
  switch (period) {
    case 'daily': dateFormat = '%Y-%m-%d'; break;
    case 'yearly': dateFormat = '%Y'; break;
    default: dateFormat = '%Y-%m'; break;
  }

  const growth = await User.findAll({
    attributes: [
      [fn('DATE_FORMAT', col('created_at'), dateFormat), 'period'],
      [fn('COUNT', col('id')), 'new_users'],
    ],
    group: [literal(`DATE_FORMAT(\`created_at\`, '${dateFormat}')`)],
    order: [[literal(`DATE_FORMAT(\`created_at\`, '${dateFormat}')`), 'DESC']],
    raw: true,
  });

  const totalUsers = await User.count();
  return { growth, totalUsers };
}

/**
 * Get orders count summary
 */
async function getOrdersSummary() {
  const [total, pending, confirmed, processing, shipped, delivered, cancelled] = await Promise.all([
    Order.count(),
    Order.count({ where: { order_status: 'pending' } }),
    Order.count({ where: { order_status: 'confirmed' } }),
    Order.count({ where: { order_status: 'processing' } }),
    Order.count({ where: { order_status: 'shipped' } }),
    Order.count({ where: { order_status: 'delivered' } }),
    Order.count({ where: { order_status: 'cancelled' } }),
  ]);

  return { total, pending, confirmed, processing, shipped, delivered, cancelled };
}

/**
 * Dashboard overview
 */
async function getDashboard() {
  const [totalRevenue, totalOrders, totalUsers, totalProducts] = await Promise.all([
    Order.sum('total_amount', { where: { payment_status: 'paid' } }),
    Order.count({ where: { payment_status: 'paid' } }),
    User.count(),
    Product.count({ where: { is_active: true } }),
  ]);

  return {
    totalRevenue: totalRevenue || 0,
    totalOrders,
    totalUsers,
    totalProducts,
  };
}

module.exports = {
  getSalesAnalytics,
  getRevenueSplit,
  getTopProducts,
  getTopBrands,
  getUserGrowth,
  getOrdersSummary,
  getDashboard,
};
