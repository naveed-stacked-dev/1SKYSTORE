const Joi = require('joi');

const createBlog = {
  body: Joi.object({
    title: Joi.string().max(500).required(),
    content: Joi.string().required(),
    excerpt: Joi.string().max(500).optional(),
    cover_image_url: Joi.string().uri().optional(),
    is_published: Joi.boolean().optional(),
    meta_title: Joi.string().max(255).optional(),
    meta_description: Joi.string().max(500).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
  }),
};

const updateBlog = {
  body: Joi.object({
    title: Joi.string().max(500).optional(),
    content: Joi.string().optional(),
    excerpt: Joi.string().max(500).optional(),
    cover_image_url: Joi.string().uri().optional().allow(null),
    is_published: Joi.boolean().optional(),
    meta_title: Joi.string().max(255).optional(),
    meta_description: Joi.string().max(500).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
  }),
};

module.exports = { createBlog, updateBlog };
