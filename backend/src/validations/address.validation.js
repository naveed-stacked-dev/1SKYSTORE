const Joi = require('joi');

const createAddress = {
  body: Joi.object({
    label: Joi.string().max(50).optional(),
    full_name: Joi.string().max(200).required(),
    phone: Joi.string().max(20).required(),
    address_line1: Joi.string().max(500).required(),
    address_line2: Joi.string().max(500).optional().allow(''),
    city: Joi.string().max(100).required(),
    state: Joi.string().max(100).required(),
    country: Joi.string().max(100).required(),
    postal_code: Joi.string().max(20).required(),
    is_default: Joi.boolean().optional(),
  }),
};

const updateAddress = {
  body: Joi.object({
    label: Joi.string().max(50).optional(),
    full_name: Joi.string().max(200).optional(),
    phone: Joi.string().max(20).optional(),
    address_line1: Joi.string().max(500).optional(),
    address_line2: Joi.string().max(500).optional().allow(''),
    city: Joi.string().max(100).optional(),
    state: Joi.string().max(100).optional(),
    country: Joi.string().max(100).optional(),
    postal_code: Joi.string().max(20).optional(),
    is_default: Joi.boolean().optional(),
  }),
};

module.exports = { createAddress, updateAddress };
