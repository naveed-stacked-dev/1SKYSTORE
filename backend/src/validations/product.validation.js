const Joi = require('joi');

const createProduct = {
  body: Joi.object({
    name: Joi.string().max(255).required(),
    sku: Joi.string().max(100).required(),
    description: Joi.string().optional(),
    short_description: Joi.string().max(500).optional(),
    price_usd: Joi.number().min(0).required(),
    price_inr: Joi.number().min(0).required(),
    compare_at_price_usd: Joi.number().min(0).optional(),
    compare_at_price_inr: Joi.number().min(0).optional(),
    category: Joi.string().max(100).optional(),
    brand: Joi.string().max(100).optional(),
    stock: Joi.number().integer().min(0).optional(),
    low_stock_threshold: Joi.number().integer().min(0).optional(),
    weight: Joi.number().min(0).optional(),
    dimensions: Joi.object({
      length: Joi.number().optional(),
      width: Joi.number().optional(),
      height: Joi.number().optional(),
    }).optional(),
    is_active: Joi.boolean().optional(),
    meta_title: Joi.string().max(255).optional(),
    meta_description: Joi.string().max(500).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    hsn_code: Joi.string().max(20).optional(),
    gst_percentage: Joi.number().min(0).max(100).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
  }),
};

const updateProduct = {
  body: Joi.object({
    name: Joi.string().max(255).optional(),
    sku: Joi.string().max(100).optional(),
    description: Joi.string().optional(),
    short_description: Joi.string().max(500).optional(),
    price_usd: Joi.number().min(0).optional(),
    price_inr: Joi.number().min(0).optional(),
    compare_at_price_usd: Joi.number().min(0).allow(null).optional(),
    compare_at_price_inr: Joi.number().min(0).allow(null).optional(),
    category: Joi.string().max(100).optional(),
    brand: Joi.string().max(100).optional(),
    stock: Joi.number().integer().min(0).optional(),
    low_stock_threshold: Joi.number().integer().min(0).optional(),
    weight: Joi.number().min(0).optional(),
    dimensions: Joi.object({
      length: Joi.number().optional(),
      width: Joi.number().optional(),
      height: Joi.number().optional(),
    }).optional(),
    is_active: Joi.boolean().optional(),
    meta_title: Joi.string().max(255).optional(),
    meta_description: Joi.string().max(500).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    hsn_code: Joi.string().max(20).optional(),
    gst_percentage: Joi.number().min(0).max(100).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
  }),
};

const listProducts = {
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    pageSize: Joi.number().integer().min(1).max(100).optional(),
    search: Joi.string().optional(),
    category: Joi.string().optional(),
    brand: Joi.string().optional(),
    min_price: Joi.number().min(0).optional(),
    max_price: Joi.number().min(0).optional(),
    sort_by: Joi.string().valid('price_asc', 'price_desc', 'newest', 'oldest', 'name').optional(),
    is_active: Joi.boolean().optional(),
  }),
};

module.exports = { createProduct, updateProduct, listProducts };
