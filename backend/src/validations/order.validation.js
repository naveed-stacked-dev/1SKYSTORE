const Joi = require('joi');

const createOrder = {
  body: Joi.object({
    address_id: Joi.number().integer().required(),
    coupon_code: Joi.string().max(50).optional(),
    notes: Joi.string().max(1000).optional(),
    payment_provider: Joi.string().valid('stripe', 'razorpay').required(),
  }),
};

const updateOrderStatus = {
  body: Joi.object({
    order_status: Joi.string().valid(
      'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'
    ).required(),
  }),
};

const listOrders = {
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    pageSize: Joi.number().integer().min(1).max(100).optional(),
    payment_status: Joi.string().valid('pending', 'paid', 'failed', 'refunded').optional(),
    order_status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned').optional(),
    from_date: Joi.date().iso().optional(),
    to_date: Joi.date().iso().optional(),
    user_id: Joi.number().integer().optional(),
  }),
};

module.exports = { createOrder, updateOrderStatus, listOrders };
