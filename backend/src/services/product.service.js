const { Op } = require('sequelize');
const XLSX = require('xlsx');
const { Product, ProductImage, ImportLog, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

/**
 * Create a new product with images
 */
async function createProduct(data) {
  const existingSku = await Product.findOne({ where: { sku: data.sku } });
  if (existingSku) throw ApiError.conflict(`Product with SKU '${data.sku}' already exists`);

  const transaction = await sequelize.transaction();
  try {
    const product = await Product.create(data, { transaction });

    // Create product images if provided
    if (data.images && data.images.length > 0) {
      const imageRecords = data.images.map((url, index) => ({
        product_id: product.id,
        image_url: url,
        is_primary: index === 0,
        sort_order: index,
      }));
      await ProductImage.bulkCreate(imageRecords, { transaction });
    }

    await transaction.commit();

    return getProductById(product.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Update a product
 */
async function updateProduct(productId, data) {
  const product = await Product.findByPk(productId);
  if (!product) throw ApiError.notFound('Product not found');

  if (data.sku && data.sku !== product.sku) {
    const existingSku = await Product.findOne({ where: { sku: data.sku, id: { [Op.ne]: productId } } });
    if (existingSku) throw ApiError.conflict(`SKU '${data.sku}' is already in use`);
  }

  const transaction = await sequelize.transaction();
  try {
    await product.update(data, { transaction });

    // Update images if provided
    if (data.images !== undefined) {
      await ProductImage.destroy({ where: { product_id: productId }, transaction, force: true });
      if (data.images.length > 0) {
        const imageRecords = data.images.map((url, index) => ({
          product_id: productId,
          image_url: url,
          is_primary: index === 0,
          sort_order: index,
        }));
        await ProductImage.bulkCreate(imageRecords, { transaction });
      }
    }

    await transaction.commit();
    return getProductById(productId);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Get product by ID with images
 */
async function getProductById(productId) {
  const product = await Product.findByPk(productId, {
    include: [{ model: ProductImage, as: 'images', attributes: ['id', 'image_url', 'is_primary', 'sort_order', 'alt_text'] }],
  });
  if (!product) throw ApiError.notFound('Product not found');
  return product;
}

/**
 * Get product by slug (public)
 */
async function getProductBySlug(slug) {
  const product = await Product.findOne({
    where: { slug, is_active: true },
    include: [{ model: ProductImage, as: 'images', attributes: ['id', 'image_url', 'is_primary', 'sort_order', 'alt_text'] }],
  });
  if (!product) throw ApiError.notFound('Product not found');
  return product;
}

/**
 * List products with filtering, search, and pagination
 */
async function listProducts(query) {
  const { limit, offset, page, pageSize } = getPagination(query);

  const where = {};

  // Active filter (public defaults to active only)
  if (query.is_active !== undefined) {
    where.is_active = query.is_active;
  }

  // Search
  if (query.search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${query.search}%` } },
      { sku: { [Op.like]: `%${query.search}%` } },
      { description: { [Op.like]: `%${query.search}%` } },
    ];
  }

  // Category filter
  if (query.category) {
    where.category = query.category;
  }

  // Brand filter
  if (query.brand) {
    where.brand = query.brand;
  }

  // Price range (USD as default for filtering)
  if (query.min_price) {
    where.price_usd = { ...where.price_usd, [Op.gte]: query.min_price };
  }
  if (query.max_price) {
    where.price_usd = { ...where.price_usd, [Op.lte]: query.max_price };
  }

  // Sorting
  let order = [['created_at', 'DESC']];
  if (query.sort_by) {
    switch (query.sort_by) {
      case 'price_asc': order = [['price_usd', 'ASC']]; break;
      case 'price_desc': order = [['price_usd', 'DESC']]; break;
      case 'newest': order = [['created_at', 'DESC']]; break;
      case 'oldest': order = [['created_at', 'ASC']]; break;
      case 'name': order = [['name', 'ASC']]; break;
    }
  }

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: [{ model: ProductImage, as: 'images', attributes: ['id', 'image_url', 'is_primary', 'sort_order'] }],
    order,
    limit,
    offset,
    distinct: true,
  });

  return { products: rows, pagination: getPaginationMeta(count, page, pageSize) };
}

/**
 * Toggle product active status
 */
async function toggleProductStatus(productId) {
  const product = await Product.findByPk(productId);
  if (!product) throw ApiError.notFound('Product not found');
  product.is_active = !product.is_active;
  await product.save();
  return product;
}

/**
 * Soft delete a product
 */
async function deleteProduct(productId) {
  const product = await Product.findByPk(productId);
  if (!product) throw ApiError.notFound('Product not found');
  await product.destroy(); // soft delete due to paranoid: true
  return { message: 'Product deleted successfully' };
}

/**
 * Get distinct categories
 */
async function getCategories() {
  const categories = await Product.findAll({
    attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
    where: { category: { [Op.ne]: null }, is_active: true },
    raw: true,
  });
  return categories.map((c) => c.category).filter(Boolean);
}

/**
 * Get distinct brands
 */
async function getBrands() {
  const brands = await Product.findAll({
    attributes: [[sequelize.fn('DISTINCT', sequelize.col('brand')), 'brand']],
    where: { brand: { [Op.ne]: null }, is_active: true },
    raw: true,
  });
  return brands.map((b) => b.brand).filter(Boolean);
}

/**
 * Bulk import products from XLSX buffer
 */
async function bulkImport(fileBuffer, adminId, filename) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet);

  const importLog = await ImportLog.create({
    admin_id: adminId,
    filename,
    total_rows: rows.length,
    status: 'processing',
  });

  const errors = [];
  let successCount = 0;

  const transaction = await sequelize.transaction();
  try {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 for header row + 0-index

      // Validate required fields
      if (!row.name || !row.sku || row.price_usd === undefined || row.price_inr === undefined) {
        errors.push({ row: rowNum, message: 'Missing required fields: name, sku, price_usd, price_inr' });
        continue;
      }

      // Check SKU uniqueness
      const existingSku = await Product.findOne({ where: { sku: row.sku }, transaction });
      if (existingSku) {
        errors.push({ row: rowNum, sku: row.sku, message: `SKU '${row.sku}' already exists` });
        continue;
      }

      try {
        const product = await Product.create({
          name: row.name,
          sku: row.sku,
          description: row.description || null,
          short_description: row.short_description || null,
          price_usd: parseFloat(row.price_usd) || 0,
          price_inr: parseFloat(row.price_inr) || 0,
          compare_at_price_usd: row.compare_at_price_usd ? parseFloat(row.compare_at_price_usd) : null,
          compare_at_price_inr: row.compare_at_price_inr ? parseFloat(row.compare_at_price_inr) : null,
          category: row.category || null,
          brand: row.brand || null,
          stock: parseInt(row.stock, 10) || 0,
          weight: row.weight ? parseFloat(row.weight) : null,
          is_active: row.is_active !== undefined ? Boolean(row.is_active) : true,
          hsn_code: row.hsn_code || null,
          gst_percentage: row.gst_percentage ? parseFloat(row.gst_percentage) : 18,
          meta_title: row.meta_title || null,
          meta_description: row.meta_description || null,
        }, { transaction });

        // Parse comma-separated image URLs
        if (row.images) {
          const imageUrls = row.images.split(',').map((url) => url.trim()).filter(Boolean);
          if (imageUrls.length > 0) {
            const imageRecords = imageUrls.map((url, idx) => ({
              product_id: product.id,
              image_url: url,
              is_primary: idx === 0,
              sort_order: idx,
            }));
            await ProductImage.bulkCreate(imageRecords, { transaction });
          }
        }

        successCount++;
      } catch (err) {
        errors.push({ row: rowNum, sku: row.sku, message: err.message });
      }
    }

    await transaction.commit();

    await importLog.update({
      success_count: successCount,
      error_count: errors.length,
      errors_json: errors.length > 0 ? errors : null,
      status: errors.length === rows.length ? 'failed' : 'completed',
    });

    return importLog.reload();
  } catch (error) {
    await transaction.rollback();
    await importLog.update({ status: 'failed', errors_json: [{ message: error.message }] });
    throw error;
  }
}

module.exports = {
  createProduct,
  updateProduct,
  getProductById,
  getProductBySlug,
  listProducts,
  toggleProductStatus,
  deleteProduct,
  getCategories,
  getBrands,
  bulkImport,
};
