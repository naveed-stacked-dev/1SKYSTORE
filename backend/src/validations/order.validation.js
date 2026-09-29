const Joi = require('joi');

const createOrder = {
  body: Joi.object({
    address_id: Joi.number().integer().required(),
    coupon_code: Joi.string().max(50).optional().allow('', null),
    shipping_courier_id: Joi.number().integer().optional().allow(null),
    shipping_cost: Joi.number().min(0).optional().allow(null),
    notes: Joi.string().max(1000).optional(),
    payment_provider: Joi.string().valid('stripe', 'razorpay').default('razorpay'),
  }),
};

const updateOrderStatus = {
  body: Joi.object({
    order_status: Joi.string().max(100).required(),
  }),
};

const listOrders = {
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    pageSize: Joi.number().integer().min(1).max(100).optional(),
    payment_status: Joi.string().valid('pending', 'paid', 'failed', 'refunded').optional(),
    order_status: Joi.string().max(100).optional(),
    from_date: Joi.date().iso().optional(),
    to_date: Joi.date().iso().optional(),
    user_id: Joi.number().integer().optional(),
  }),
};

module.exports = { createOrder, updateOrderStatus, listOrders };
