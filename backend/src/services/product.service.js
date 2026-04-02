const { Op } = require('sequelize');
const XLSX = require('xlsx');
const { Product, ProductImage, ImportLog, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { deleteFromS3, uploadBufferToS3 } = require('../utils/s3Utils');

/**
 * Create a new product with images
 */
async function createProduct(data, files) {
  const existingSku = await Product.findOne({ where: { sku: data.sku } });
  if (existingSku) throw ApiError.conflict(`Product with SKU '${data.sku}' already exists`);

  const transaction = await sequelize.transaction();
  try {
    const product = await Product.create(data, { transaction });

    // Upload files directly to S3 within transaction context if present
    if (files && files.length > 0) {
      const imageUrls = await Promise.all(
        files.map(async (file, index) => {
          const ext = file.originalname.split('.').pop() || 'jpg';
          const key = `products/${product.sku}/${Date.now()}-${index}.${ext}`;
          return await uploadBufferToS3(file.buffer, file.mimetype, key);
        })
      );

      const imageRecords = imageUrls.map((url, index) => ({
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
async function updateProduct(productId, data, files) {
  const product = await Product.findByPk(productId);
  if (!product) throw ApiError.notFound('Product not found');

  if (data.sku && data.sku !== product.sku) {
    const existingSku = await Product.findOne({ where: { sku: data.sku, id: { [Op.ne]: productId } } });
    if (existingSku) throw ApiError.conflict(`SKU '${data.sku}' is already in use`);
  }

  const transaction = await sequelize.transaction();
  let urlsToDelete = [];
  try {
    await product.update(data, { transaction });

    // Handle existing images
    const existingImages = await ProductImage.findAll({ where: { product_id: productId }, transaction });
    let retainedImages = existingImages.map(img => img.image_url);
    
    if (data.retainedImages) {
      try {
        retainedImages = JSON.parse(data.retainedImages);
      } catch (err) {
        /* ignore parsing error */
      }
    }

    // Determine images that user explicitly removed
    urlsToDelete = existingImages
      .map(img => img.image_url)
      .filter(url => !retainedImages.includes(url));

    // Process new uploaded files
    let newImageUrls = [];
    if (files && files.length > 0) {
      newImageUrls = await Promise.all(
        files.map(async (file, index) => {
          const ext = file.originalname.split('.').pop() || 'jpg';
          const key = `products/${product.sku}/${Date.now()}-${index}.${ext}`;
          return await uploadBufferToS3(file.buffer, file.mimetype, key);
        })
      );
    }

    // Combine retained and newly uploaded images in order
    const finalImageUrls = [...retainedImages, ...newImageUrls];

    // Wipe old DB records and recreate them to ensure `sort_order` and `is_primary` are updated properly
    await ProductImage.destroy({ where: { product_id: productId }, transaction, force: true });
    
    if (finalImageUrls.length > 0) {
      const imageRecords = finalImageUrls.map((url, index) => ({
        product_id: productId,
        image_url: url,
        is_primary: index === 0,
        sort_order: index,
      }));
      await ProductImage.bulkCreate(imageRecords, { transaction });
    }

    await transaction.commit();

    if (urlsToDelete.length > 0) {
      deleteFromS3(urlsToDelete).catch(err => console.error('Failed to delete old S3 images on update', err));
    }
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

  const transaction = await sequelize.transaction();
  let urls = [];
  try {
    // Delete associated images
    const productImages = await ProductImage.findAll({ where: { product_id: productId }, transaction });
    urls = productImages.map(img => img.image_url);

    if (urls.length > 0) {
      await ProductImage.destroy({ where: { product_id: productId }, transaction, force: true });
    }

    await product.destroy({ transaction }); // soft delete due to paranoid: true
    
    await transaction.commit();
    
    if (urls.length > 0) {
      deleteFromS3(urls).catch(err => console.error('Failed to delete S3 images on product delete', err));
    }
    return { message: 'Product deleted successfully' };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
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

      console.log(`${i + 1} ${row.name}`);

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
        const tags = [];
        if (row.treatments) {
          tags.push(...row.treatments.split(',').map(t => t.trim()));
        }
        if (row.size) {
          tags.push(`Size: ${row.size}`);
        }

        const product = await Product.create({
          name: row.name,
          sku: row.sku,
          description: row.description || null,
          short_description: row.short_description || null,
          price_usd: parseFloat(row.price_usd) || 0,
          price_inr: parseFloat(row.price_inr) || 0,
          compare_at_price_usd: null,
          compare_at_price_inr: null,
          category: row.category || null,
          brand: row.brand || null,
          stock: 0,
          weight: row.weight_gm !== undefined ? parseFloat(row.weight_gm) : null,
          dimensions: (row.length_cm || row.width_cm || row.height_cm) ? {
            length: row.length_cm ? parseFloat(row.length_cm) : null,
            width: row.width_cm ? parseFloat(row.width_cm) : null,
            height: row.height_cm ? parseFloat(row.height_cm) : null
          } : null,
          is_active: row.active !== undefined ? Boolean(row.active) : true,
          hsn_code: row.hsn_code ? String(row.hsn_code) : null,
          gst_percentage: row.igst !== undefined ? parseFloat(row.igst) : (row.cgst && row.sgst ? parseFloat(row.cgst) + parseFloat(row.sgst) : 18),
          meta_title: row.meta_title || null,
          meta_description: row.meta_description || null,
          tags: tags,
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
        console.error(`Error saving product ${row.sku} at row ${rowNum}:`, err.message || err);
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

/**
 * Get best/featured products (admin-flagged)
 */
async function getBestProducts(limit = 10) {
  const products = await Product.findAll({
    where: { is_best: true, is_active: true },
    include: [{ model: ProductImage, as: 'images', attributes: ['id', 'image_url', 'is_primary', 'sort_order'] }],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit, 10),
  });
  return products;
}

/**
 * Get products grouped by brand (top N brands, M products each)
 */
async function getProductsByBrand(brandLimit = 5, productLimit = 10) {
  // Get top brands by product count
  const brandRows = await Product.findAll({
    attributes: [
      'brand',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    where: { brand: { [Op.ne]: null }, is_active: true },
    group: ['brand'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
    limit: parseInt(brandLimit, 10),
    raw: true,
  });

  const brands = brandRows.map((b) => b.brand).filter(Boolean);
  const result = {};

  for (const brand of brands) {
    const products = await Product.findAll({
      where: { brand, is_active: true },
      include: [{ model: ProductImage, as: 'images', attributes: ['id', 'image_url', 'is_primary', 'sort_order'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(productLimit, 10),
    });
    result[brand] = products;
  }

  return result;
}

/**
 * Get products grouped by category (top N categories, M products each)
 */
async function getProductsByCategory(categoryLimit = 5, productLimit = 10) {
  const categoryRows = await Product.findAll({
    attributes: [
      'category',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    where: { category: { [Op.ne]: null }, is_active: true },
    group: ['category'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
    limit: parseInt(categoryLimit, 10),
    raw: true,
  });

  const categories = categoryRows.map((c) => c.category).filter(Boolean);
  const result = {};

  for (const category of categories) {
    const products = await Product.findAll({
      where: { category, is_active: true },
      include: [{ model: ProductImage, as: 'images', attributes: ['id', 'image_url', 'is_primary', 'sort_order'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(productLimit, 10),
    });
    result[category] = products;
  }

  return result;
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
  getBestProducts,
  getProductsByBrand,
  getProductsByCategory,
};
