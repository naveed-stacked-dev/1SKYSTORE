const Joi = require('joi');

const createAddress = {
  body: Joi.object({
    label: Joi.string().max(50).optional().allow(null),
    full_name: Joi.string().max(200).required(),
    phone: Joi.string().max(20).required(),
    address_line1: Joi.string().max(500).required(),
    address_line2: Joi.string().max(500).optional().allow('', null),
    city: Joi.string().max(100).required(),
    state: Joi.string().max(100).required(),
    country: Joi.string().max(100).required(),
    postal_code: Joi.string().max(20).required(),
    is_default: Joi.boolean().optional(),
  }).options({ stripUnknown: true }),
};

const updateAddress = {
  body: Joi.object({
    label: Joi.string().max(50).optional().allow('', null),
    full_name: Joi.string().max(200).optional().allow(''),
    phone: Joi.string().max(20).optional().allow(''),
    phone_enc: Joi.string().max(50).optional().allow(''),
    address_line1: Joi.string().max(500).optional().allow(''),
    address_line2: Joi.string().max(500).optional().allow('', null),
    city: Joi.string().max(100).optional().allow(''),
    state: Joi.string().max(100).optional().allow(''),
    country: Joi.string().max(100).optional().allow(''),
    postal_code: Joi.string().max(20).optional().allow(''),
    is_default: Joi.boolean().optional(),
  }).options({ stripUnknown: true }),
};

module.exports = { createAddress, updateAddress };
