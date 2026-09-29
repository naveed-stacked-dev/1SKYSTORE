const Joi = require('joi');

const createCoupon = {
  body: Joi.object({
    code: Joi.string().max(50).uppercase().required(),
    description: Joi.string().max(500).optional().allow('', null),
    discount_type: Joi.string().valid('percentage', 'fixed').required(),
    discount_value: Joi.number().min(0).required(),
    brand: Joi.string().max(100).optional().allow('', null),
    starts_at: Joi.date().iso().optional().allow(null),
    expires_at: Joi.date().iso().optional().allow(null),
    usage_limit: Joi.number().integer().min(1).optional().allow(null),
    is_active: Joi.boolean().optional(),
  }),
};

const applyCoupon = {
  body: Joi.object({
    code: Joi.string().required(),
  }),
};

module.exports = { createCoupon, applyCoupon };
