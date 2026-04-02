const { Op } = require('sequelize');
const { Blog, Admin } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const sequelize = require('../config/database');
const { uploadBufferToS3, deleteFromS3 } = require('../utils/s3Utils');

/**
 * Create blog (admin)
 */
async function createBlog(adminId, data, files) {
  const transaction = await sequelize.transaction();
  try {
    let cover_image_url = null;
    if (files && files.length > 0) {
      const file = files[0];
      const ext = file.originalname.split('.').pop() || 'jpg';
      const key = `blogs/${Date.now()}.${ext}`;
      cover_image_url = await uploadBufferToS3(file.buffer, file.mimetype, key);
    }

    const isPublished = data.is_published === 'true' || data.is_published === true;
    
    const blog = await Blog.create({
      ...data,
      cover_image_url,
      author_admin_id: adminId,
      published_at: isPublished ? new Date() : null,
      is_published: isPublished,
    }, { transaction });

    await transaction.commit();
    return blog;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Update blog (admin)
 */
async function updateBlog(blogId, data, files) {
  const blog = await Blog.findByPk(blogId);
  if (!blog) throw ApiError.notFound('Blog not found');

  const transaction = await sequelize.transaction();
  let urlToDelete = null;

  try {
    let cover_image_url = blog.cover_image_url;
    
    // Check if the user opted to remove the image from UI without uploading a new one
    if ('retainedImage' in data) {
      if (!data.retainedImage) {
        urlToDelete = blog.cover_image_url;
        cover_image_url = null;
      }
    }

    // Process new uploaded file correctly
    if (files && files.length > 0) {
      if (cover_image_url) urlToDelete = cover_image_url;
      const file = files[0];
      const ext = file.originalname.split('.').pop() || 'jpg';
      const key = `blogs/${Date.now()}.${ext}`;
      cover_image_url = await uploadBufferToS3(file.buffer, file.mimetype, key);
    }

    const isPublished = data.is_published === 'true' || data.is_published === true;

    // Set published_at when first published
    if (isPublished && !blog.is_published) {
      data.published_at = new Date();
    }
    
    data.is_published = isPublished;
    data.cover_image_url = cover_image_url;

    await blog.update(data, { transaction });
    await transaction.commit();
    
    // Async cleanup of the orphaned S3 object
    if (urlToDelete) {
      deleteFromS3([urlToDelete]).catch(err => console.error('Failed to completely delete S3 image for blog', err));
    }
    
    return blog;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
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

/**
 * Get blog by ID (admin — any status)
 */
async function getBlogById(blogId) {
  const blog = await Blog.findByPk(blogId, {
    include: [{ model: Admin, as: 'author', attributes: ['id', 'first_name', 'last_name', 'email'] }],
  });
  if (!blog) throw ApiError.notFound('Blog not found');
  return blog;
}

module.exports = { createBlog, updateBlog, deleteBlog, getBlogBySlug, getBlogById, listPublicBlogs, adminListBlogs };
