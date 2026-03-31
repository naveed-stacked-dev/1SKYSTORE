const { Op } = require('sequelize');
const { Blog, Admin } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

/**
 * Create blog (admin)
 */
async function createBlog(adminId, data) {
  const blog = await Blog.create({
    ...data,
    author_admin_id: adminId,
    published_at: data.is_published ? new Date() : null,
  });
  return blog;
}

/**
 * Update blog (admin)
 */
async function updateBlog(blogId, data) {
  const blog = await Blog.findByPk(blogId);
  if (!blog) throw ApiError.notFound('Blog not found');

  // Set published_at when first published
  if (data.is_published && !blog.is_published) {
    data.published_at = new Date();
  }

  await blog.update(data);
  return blog;
}

/**
 * Delete blog (soft delete)
 */
async function deleteBlog(blogId) {
  const blog = await Blog.findByPk(blogId);
  if (!blog) throw ApiError.notFound('Blog not found');
  await blog.destroy();
  return { message: 'Blog deleted successfully' };
}

/**
 * Get blog by slug (public)
 */
async function getBlogBySlug(slug) {
  const blog = await Blog.findOne({
    where: { slug, is_published: true },
    include: [{ model: Admin, as: 'author', attributes: ['id', 'first_name', 'last_name'] }],
  });
  if (!blog) throw ApiError.notFound('Blog not found');
  return blog;
}

/**
 * List published blogs (public)
 */
async function listPublicBlogs(query) {
  const { limit, offset, page, pageSize } = getPagination(query);

  const where = { is_published: true };

  if (query.search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${query.search}%` } },
      { content: { [Op.like]: `%${query.search}%` } },
    ];
  }

  const { count, rows } = await Blog.findAndCountAll({
    where,
    include: [{ model: Admin, as: 'author', attributes: ['id', 'first_name', 'last_name'] }],
    attributes: ['id', 'title', 'slug', 'excerpt', 'cover_image_url', 'published_at', 'tags', 'created_at'],
    order: [['published_at', 'DESC']],
    limit,
    offset,
  });

  return { blogs: rows, pagination: getPaginationMeta(count, page, pageSize) };
}

/**
 * List all blogs (admin — includes unpublished)
 */
async function adminListBlogs(query) {
  const { limit, offset, page, pageSize } = getPagination(query);

  const { count, rows } = await Blog.findAndCountAll({
    include: [{ model: Admin, as: 'author', attributes: ['id', 'first_name', 'last_name'] }],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return { blogs: rows, pagination: getPaginationMeta(count, page, pageSize) };
}

module.exports = { createBlog, updateBlog, deleteBlog, getBlogBySlug, listPublicBlogs, adminListBlogs };
