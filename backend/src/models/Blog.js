const { DataTypes } = require('sequelize');
const slugify = require('slugify');
const sequelize = require('../config/database');

const Blog = sequelize.define('Blog', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(600),
    allowNull: false,
    unique: true,
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  excerpt: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  cover_image_url: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
  author_admin_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  meta_title: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  meta_description: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  tableName: 'blogs',
  indexes: [
    { fields: ['slug'], unique: true },
    { fields: ['is_published'] },
    { fields: ['author_admin_id'] },
  ],
});

// Hook to automatically generate slug from title before validation runs
Blog.beforeValidate(async (blog) => {
  if (blog.title && !blog.slug) {
    let baseSlug = slugify(blog.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    // Ensure slug uniqueness
    while (await Blog.findOne({ where: { slug }, paranoid: false })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    blog.slug = slug;
  }
});

module.exports = Blog;
