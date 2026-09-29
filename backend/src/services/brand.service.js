const { Op } = require('sequelize');
const { Brand, Product } = require('../models');
const ApiError = require('../utils/ApiError');
const { deleteFromS3, uploadBufferToS3 } = require('../utils/s3Utils');
const slugify = require('slugify');

/**
 * Auto-sync brands from products table into the Brand table
 */
async function syncProductBrands() {
  const productBrands = await Product.findAll({
    attributes: [[Brand.sequelize.fn('DISTINCT', Brand.sequelize.col('brand')), 'brand']],
    where: { brand: { [Op.ne]: null } },
    raw: true,
  });

  const existingBrands = await Brand.findAll({ attributes: ['slug'], raw: true });
  const existingSlugs = new Set(existingBrands.map(b => b.slug));

  const newBrands = [];
  for (const pb of productBrands) {
    if (!pb.brand) continue;
    const name = pb.brand.trim();
    if (!name) continue;
    const slug = slugify(name, { lower: true, strict: true });
    if (!existingSlugs.has(slug)) {
      newBrands.push({ name, slug });
      existingSlugs.add(slug);
    }
  }

  if (newBrands.length > 0) {
    await Brand.bulkCreate(newBrands, { ignoreDuplicates: true });
  }
}

/**
 * List all brands (admin)
 */
async function listBrands(query = {}) {
  await syncProductBrands();
  
  const where = {};
  if (query.is_active !== undefined) {
    where.is_active = query.is_active === 'true' || query.is_active === true;
  }
  if (query.search) {
    where.name = { [Op.like]: `%${query.search}%` };
  }
  const brands = await Brand.findAll({
    where,
    order: [['sort_order', 'ASC'], ['name', 'ASC']],
  });
  return brands;
}

/**
 * List active brands (public)
 */
async function listPublicBrands() {
  await syncProductBrands();

  return Brand.findAll({
    where: { is_active: true },
    order: [['sort_order', 'ASC'], ['name', 'ASC']],
  });
}

/**
 * Get brand by id
 */
async function getBrandById(id) {
  const brand = await Brand.findByPk(id);
  if (!brand) throw ApiError.notFound('Brand not found');
  return brand;
}

/**
 * Create a brand
 */
async function createBrand(data, file) {
  const slug = slugify(data.name, { lower: true, strict: true });

  const existing = await Brand.findOne({ where: { [Op.or]: [{ name: data.name }, { slug }] } });
  if (existing) throw ApiError.conflict(`Brand '${data.name}' already exists`);

  let image_url = null;
  if (file) {
    const ext = file.originalname.split('.').pop() || 'jpg';
    const key = `brands/${slug}-${Date.now()}.${ext}`;
    image_url = await uploadBufferToS3(file.buffer, file.mimetype, key);
  }

  return Brand.create({
    name: data.name.trim(),
    slug,
    image_url,
    is_active: data.is_active !== undefined ? (data.is_active === 'true' || data.is_active === true) : true,
    sort_order: parseInt(data.sort_order, 10) || 0,
  });
}

/**
 * Update a brand
 */
async function updateBrand(id, data, file) {
  const brand = await Brand.findByPk(id);
  if (!brand) throw ApiError.notFound('Brand not found');

  let image_url = brand.image_url;
  let oldImageUrl = null;

  if (file) {
    oldImageUrl = brand.image_url;
    const slug = slugify(data.name || brand.name, { lower: true, strict: true });
    const ext = file.originalname.split('.').pop() || 'jpg';
    const key = `brands/${slug}-${Date.now()}.${ext}`;
    image_url = await uploadBufferToS3(file.buffer, file.mimetype, key);
  }

  if (data.remove_image === 'true' || data.remove_image === true) {
    oldImageUrl = brand.image_url;
    image_url = null;
  }

  const updateData = { image_url };
  if (data.name) {
    updateData.name = data.name.trim();
    updateData.slug = slugify(data.name, { lower: true, strict: true });
  }
  if (data.is_active !== undefined) {
    updateData.is_active = data.is_active === 'true' || data.is_active === true;
  }
  if (data.sort_order !== undefined) {
    updateData.sort_order = parseInt(data.sort_order, 10) || 0;
  }

  await brand.update(updateData);

  if (oldImageUrl) {
    deleteFromS3([oldImageUrl]).catch(err => console.error('Failed to delete old brand image from S3', err));
  }

  return brand.reload();
}

/**
 * Delete a brand
 */
async function deleteBrand(id) {
  const brand = await Brand.findByPk(id);
  if (!brand) throw ApiError.notFound('Brand not found');

  const imageUrl = brand.image_url;
  await brand.destroy({ force: true });

  if (imageUrl) {
    deleteFromS3([imageUrl]).catch(err => console.error('Failed to delete brand image from S3', err));
  }

  return { message: 'Brand deleted successfully' };
}

/**
 * Toggle brand active status
 */
async function toggleBrandStatus(id) {
  const brand = await Brand.findByPk(id);
  if (!brand) throw ApiError.notFound('Brand not found');
  brand.is_active = !brand.is_active;
  await brand.save();
  return brand;
}

module.exports = { listBrands, listPublicBrands, getBrandById, createBrand, updateBrand, deleteBrand, toggleBrandStatus, syncProductBrands };
