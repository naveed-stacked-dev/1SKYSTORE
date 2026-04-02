const Joi = require('joi');

const createBlog = {
  body: Joi.object({
    title: Joi.string().max(500).required(),
    content: Joi.string().required(),
    excerpt: Joi.string().max(500).allow('').optional(),
    is_published: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')).optional(),
    meta_title: Joi.string().max(255).allow('').optional(),
    meta_description: Joi.string().max(500).allow('').optional(),
    tags: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  }),
};

const updateBlog = {
  body: Joi.object({
    title: Joi.string().max(500).optional(),
    content: Joi.string().optional(),
    excerpt: Joi.string().max(500).allow('').optional(),
    is_published: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')).optional(),
    meta_title: Joi.string().max(255).allow('').optional(),
    meta_description: Joi.string().max(500).allow('').optional(),
    tags: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
    retainedImage: Joi.string().allow('', null).optional(),
  }),
};

module.exports = { createBlog, updateBlog };
