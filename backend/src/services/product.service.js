const { Op } = require('sequelize');
const XLSX = require('xlsx');
const { Product, ProductImage, ImportLog, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { deleteFromS3, uploadBufferToS3 } = require('../utils/s3Utils');
const { EXPORT_ROW_CAP, toNumber, toDateString } = require('../utils/exportUtils');
const {
  IMPORT_DETAIL_CAP,
  cleanString,
  parseNumber,
  readSheetRows,
  resolveImages,
  buildProductPayload,
  sameOrderedList,
} = require('../utils/productImportUtils');

// ─── Search helpers ──────────────────────────────────────────────────────────
// Characters stripped when "squishing" a string for separator-insensitive matching,
// so "NL-2", "nl 2" and "nl2" all compare as equal.
const SEARCH_STRIP_CHARS = [' ', '-', '_', '.', '/', '(', ')', ',', '&', "'", '+', ':', ';'];

/**
 * Split a string into search tokens. Breaks on whitespace/punctuation AND on
 * letter↔digit boundaries, so "nl2", "nl 2" and "nl-2" all yield ["nl", "2"].
 * This is what lets "NL-2" (tokens nl,2) be told apart from "NL-20" (tokens nl,20).
 */
function tokenizeSearch(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/([a-z])([0-9])/g, '$1 $2')
    .replace(/([0-9])([a-z])/g, '$1 $2')
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Collapse a string to lowercase alphanumerics only (drops every separator). */
function squishSearch(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

/** True if `needle` tokens appear as a consecutive, in-order run inside `haystack`. */
function tokensInOrder(haystack, needle) {
  for (let i = 0; i + needle.length <= haystack.length; i += 1) {
    let match = true;
    for (let j = 0; j < needle.length; j += 1) {
      if (haystack[i + j] !== needle[j]) { match = false; break; }
    }
    if (match) return true;
  }
  return false;
}

/**
 * SQL expression that squishes a column to lowercase alphanumerics via nested
 * REPLACE() — works on every MySQL version (no REGEXP_REPLACE / version checks needed).
 */
function sqlSquishColumn(column) {
  let expr = `LOWER(\`${column}\`)`;
  for (const ch of SEARCH_STRIP_CHARS) {
    expr = `REPLACE(${expr}, ${sequelize.escape(ch)}, '')`;
  }
  return expr;
}

/**
 * Relevance score for a product against a parsed search query (higher = better).
 * Tuned so an exact token/code match ("NL-2" for "nl 2") always outranks a mere
 * prefix match ("NL-20"), and a whole-word hit outranks a buried substring.
 */
function relevanceScore(product, queryTokens, querySquished) {
  const nameTokens = tokenizeSearch(product.name);
  const nameSquished = squishSearch(product.name);
  const skuSquished = squishSearch(product.sku);
  let score = 0;

  // Whole-query signals (strongest)
  if (querySquished) {
    if (nameSquished === querySquished) score += 1000;   // name is exactly the query
    if (skuSquished === querySquished) score += 800;     // sku is exactly the query
    const at = nameSquished.indexOf(querySquished);
    if (at === 0) score += 250;                          // name begins with the query chunk
    else if (at > 0) score += 150;                       // query chunk appears within the name
    if (skuSquished.includes(querySquished)) score += 120;
  }

  // Per-token signals
  let exact = 0;
  let prefix = 0;
  let partial = 0;
  for (const qt of queryTokens) {
    if (nameTokens.includes(qt)) exact += 1;                        // whole-word match
    else if (nameTokens.some((t) => t.startsWith(qt))) prefix += 1; // word-prefix ("2" → "20")
    else if (nameSquished.includes(qt)) partial += 1;               // buried substring
  }
  if (queryTokens.length && exact === queryTokens.length) score += 400; // every term is an exact word
  score += exact * 60 + prefix * 20 + partial * 5;

  // Bonus when the query words appear together and in order ("nl 2" → "...NL 2...")
  if (queryTokens.length > 1 && tokensInOrder(nameTokens, queryTokens)) score += 200;

  // Tie-break: prefer shorter / more specific names
  score -= nameSquished.length * 0.05;

  return score;
}

/**
 * Create a new product with images
 */
async function createProduct(data, files) {
  const existingSku = await Product.findOne({ where: { sku: data.sku } });
  if (existingSku) throw ApiError.conflict(`Product with SKU '${data.sku}' already exists`);

  if (data.symptom && typeof data.symptom === 'string') {
    data.symptom = data.symptom.split(',').map(s => s.trim()).filter(Boolean);
  }

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

  if (data.symptom && typeof data.symptom === 'string') {
    data.symptom = data.symptom.split(',').map(s => s.trim()).filter(Boolean);
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
 * Build the Sequelize where/order shared by product listing and export, so an
 * export always returns exactly the rows the admin is looking at.
 */
function buildProductQuery(query) {
  const where = {};

  // Active filter (public defaults to active only)
  if (query.is_active !== undefined) {
    where.is_active = query.is_active;
  }
  if (query.is_trending !== undefined) {
    where.is_trending = query.is_trending;
  }
  if (query.is_best !== undefined) {
    where.is_best = query.is_best === 'true' || query.is_best === true;
  }
  if (query.is_featured !== undefined) {
    where.is_featured = query.is_featured === 'true' || query.is_featured === true;
  }

  // Search — separator-insensitive match on name & SKU only (NOT description), so
  // results stay precise. Every query term must appear, and "nl 2" / "nl-2" / "nl2"
  // are treated identically by comparing against a squished (alphanumeric-only) form.
  // Final ranking happens in JS below so an exact code ("NL-2") beats a prefix ("NL-20").
  const searchTokens = query.search ? tokenizeSearch(query.search) : [];
  const searchSquished = query.search ? squishSearch(query.search) : '';
  if (searchTokens.length > 0) {
    if (!where[Op.and]) where[Op.and] = [];
    searchTokens.forEach((term) => {
      where[Op.and].push({
        [Op.or]: [
          sequelize.where(sequelize.literal(sqlSquishColumn('name')), { [Op.like]: `%${term}%` }),
          sequelize.where(sequelize.literal(sqlSquishColumn('sku')), { [Op.like]: `%${term}%` }),
        ],
      });
    });
  }

  // Category filter
  if (query.category) {
    where.category = { [Op.in]: Array.isArray(query.category) ? query.category : query.category.split(',') };
  }

  // Brand filter
  if (query.brand) {
    where.brand = { [Op.in]: Array.isArray(query.brand) ? query.brand : query.brand.split(',') };
  }

  // Symptom filter
  if (query.symptom) {
    const symptoms = Array.isArray(query.symptom) ? query.symptom : query.symptom.split(',');
    const symptomConditions = symptoms.map(symp =>
      sequelize.where(sequelize.fn('JSON_CONTAINS', sequelize.col('symptom'), JSON.stringify(symp.trim())), 1)
    );

    if (!where[Op.and]) where[Op.and] = [];
    where[Op.and].push({ [Op.or]: symptomConditions });
  }

  // Stock filter
  if (query.stock !== undefined && query.stock !== '') {
    if (query.stock === '0' || query.stock === 0 || query.stock === 'outOfStock') {
      where.stock = 0;
    } else if (query.stock === 'lowStock') {
      where.stock = { [Op.gt]: 0, [Op.lt]: 10 };
    }
  }

  // Price range (USD)
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

  return { where, order, searchTokens, searchSquished };
}

/**
 * List products with filtering, search, and pagination
 */
async function listProducts(query) {
  const { limit, offset, page, pageSize } = getPagination(query);
  const { where, order, searchTokens, searchSquished } = buildProductQuery(query);

  const imageInclude = [{ model: ProductImage, as: 'images', attributes: ['id', 'image_url', 'is_primary', 'sort_order'] }];

  // Relevance path: when searching without an explicit sort, rank matches in JS so
  // the closest product wins (SQL LIKE ordering can't tell "NL-2" from "NL-20").
  // At catalogue scale the matched set is small, so this is cheap and far more accurate.
  if (searchTokens.length > 0 && !query.sort_by) {
    const CANDIDATE_CAP = 2000;
    // Cheap fetch (no images) of everything that matches, then score & paginate.
    const candidates = await Product.findAll({
      where,
      attributes: ['id', 'name', 'sku'],
      order: [['name', 'ASC']],
      limit: CANDIDATE_CAP,
      raw: true,
    });
    if (candidates.length === CANDIDATE_CAP) {
      console.warn(`[search] "${query.search}" hit the ${CANDIDATE_CAP}-result cap; ranking may omit some matches.`);
    }

    const rankedIds = candidates
      .map((p) => ({ id: p.id, name: p.name, score: relevanceScore(p, searchTokens, searchSquished) }))
      .sort((a, b) => b.score - a.score || String(a.name).localeCompare(String(b.name)))
      .map((x) => x.id);

    const count = rankedIds.length;
    const pageIds = rankedIds.slice(offset, offset + limit);

    // Load full rows (with images) only for this page, then restore the ranked order.
    const pageRows = await Product.findAll({ where: { id: { [Op.in]: pageIds } }, include: imageInclude });
    const byId = new Map(pageRows.map((p) => [p.id, p]));
    const products = pageIds.map((id) => byId.get(id)).filter(Boolean);

    return { products, pagination: getPaginationMeta(count, page, pageSize) };
  }

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: imageInclude,
    order,
    limit,
    offset,
    distinct: true,
  });

  return { products: rows, pagination: getPaginationMeta(count, page, pageSize) };
}

/**
 * Export products matching the current filters as flat rows.
 * Column names mirror the bulk-import template so an export can be re-imported.
 */
async function exportProducts(query) {
  const { where, order } = buildProductQuery(query);

  const rows = await Product.findAll({
    where,
    include: [{ model: ProductImage, as: 'images', attributes: ['image_url', 'is_primary', 'sort_order'] }],
    order,
    limit: EXPORT_ROW_CAP,
  });

  return rows.map((p) => {
    const images = [...(p.images || [])]
      .sort((a, b) => (b.is_primary === true) - (a.is_primary === true) || (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((img) => img.image_url);
    const dims = p.dimensions || {};

    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      slug: p.slug,
      category: p.category || '',
      brand: p.brand || '',
      symptom: Array.isArray(p.symptom) ? p.symptom.join(', ') : (p.symptom || ''),
      price_usd: toNumber(p.price_usd),
      compare_at_price_usd: toNumber(p.compare_at_price_usd),
      stock: p.stock ?? 0,
      low_stock_threshold: p.low_stock_threshold ?? 0,
      active: p.is_active ? 'Yes' : 'No',
      is_best: p.is_best ? 'Yes' : 'No',
      is_featured: p.is_featured ? 'Yes' : 'No',
      is_trending: p.is_trending ? 'Yes' : 'No',
      hsn_code: p.hsn_code || '',
      igst: toNumber(p.gst_percentage),
      weight_gm: toNumber(p.weight),
      length_cm: toNumber(dims.length),
      width_cm: toNumber(dims.width),
      height_cm: toNumber(dims.height),
      short_description: p.short_description || '',
      description: p.description || '',
      meta_title: p.meta_title || '',
      meta_description: p.meta_description || '',
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
      images: images.join(', '),
      created_at: toDateString(p.created_at || p.createdAt),
    };
  });
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
 * Toggle product featured status
 */
async function toggleFeaturedStatus(productId) {
  const product = await Product.findByPk(productId);
  if (!product) throw ApiError.notFound('Product not found');
  product.is_featured = !product.is_featured;
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

    await product.destroy({ transaction, force: true });

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
 * Get distinct brands (merged from Product distinct brands and Brand table)
 */
async function getBrands() {
  const brandService = require('./brand.service');
  await brandService.syncProductBrands();

  const { Brand } = require('../models');
  const brands = await Brand.findAll({
    where: { is_active: true },
    attributes: ['name'],
    raw: true,
    order: [['name', 'ASC']],
  });
  return brands.map((b) => b.name).filter(Boolean);
}

/**
 * Get distinct symptoms
 */
async function getSymptoms() {
  const products = await Product.findAll({
    attributes: ['symptom'],
    where: { symptom: { [Op.ne]: null }, is_active: true },
    raw: true,
  });
  const allSymptoms = new Set();
  products.forEach(p => {
    if (Array.isArray(p.symptom)) {
      p.symptom.forEach(s => allSymptoms.add(s));
    } else if (typeof p.symptom === 'string') {
      try {
        const arr = JSON.parse(p.symptom);
        if (Array.isArray(arr)) arr.forEach(s => allSymptoms.add(s));
      } catch (e) {
        allSymptoms.add(p.symptom);
      }
    }
  });
  return Array.from(allSymptoms).filter(Boolean);
}

/**
 * Replace the ProductImage rows of a product with an ordered URL list.
 * The first URL becomes the primary image, mirroring the export ordering.
 */
async function writeProductImages(productId, urls, transaction) {
  if (!urls.length) return;
  await ProductImage.bulkCreate(
    urls.map((url, index) => ({
      product_id: productId,
      image_url: url,
      is_primary: index === 0,
      sort_order: index,
    })),
    { transaction }
  );
}

/** Ordered image URLs of a product, using the same order the export writes. */
async function readProductImageUrls(productId, transaction) {
  const images = await ProductImage.findAll({
    where: { product_id: productId },
    order: [['is_primary', 'DESC'], ['sort_order', 'ASC']],
    attributes: ['image_url'],
    transaction,
  });
  return images.map((img) => img.image_url);
}

/**
 * Bulk import products from an XLSX/CSV buffer.
 *
 * Each row is upserted rather than blindly inserted:
 *   - matched to an existing product by `id` (when the export's id column is
 *     present) and otherwise by `sku`;
 *   - diffed field-by-field against what is stored, so a re-uploaded export
 *     only writes the rows the admin actually edited;
 *   - reported back per row as added / updated / unchanged / failed.
 *
 * Only columns present in the sheet's header row are considered "managed", so
 * a trimmed-down sheet (e.g. just sku + stock) never clears other fields.
 */
async function bulkImport(fileBuffer, adminId, filename) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw ApiError.badRequest('The uploaded file has no readable sheet');

  const { columns, rows } = readSheetRows(sheet);

  const importLog = await ImportLog.create({
    admin_id: adminId,
    filename,
    total_rows: rows.length,
    status: 'processing',
  });

  const errors = [];
  const results = [];
  const counts = { added: 0, updated: 0, unchanged: 0, failed: 0 };
  // Guards against the same product appearing twice in one file, which would
  // otherwise show up as a confusing "updated" right after an "added".
  const seenProductRows = new Map();
  const seenSkuRows = new Map();

  const transaction = await sequelize.transaction();
  try {
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const rowNum = i + 2; // +1 for the header row, +1 to make it 1-based
      const rowSku = cleanString(row.sku);
      const rowName = cleanString(row.name);

      const fail = (message) => {
        counts.failed += 1;
        errors.push({ row: rowNum, sku: rowSku || undefined, message });
        results.push({ row: rowNum, sku: rowSku, name: rowName, status: 'failed', changes: [], message });
      };

      try {
        // ── Identify the target product ───────────────────────────────────
        let product = null;
        const rowId = columns.has('id') ? parseNumber(row.id) : null;
        if (rowId !== null && rowId > 0) {
          product = await Product.findByPk(Math.trunc(rowId), { transaction });
        }
        if (!product && rowSku) {
          product = await Product.findOne({ where: { sku: rowSku }, transaction });
        }
        if (!product && !rowSku) {
          fail('Row has no sku (or matching id) to identify the product');
          continue;
        }

        if (product && seenProductRows.has(product.id)) {
          fail(`Duplicate row: this product was already processed at row ${seenProductRows.get(product.id)}`);
          continue;
        }
        if (!product && seenSkuRows.has(rowSku.toLowerCase())) {
          fail(`Duplicate row: SKU '${rowSku}' was already processed at row ${seenSkuRows.get(rowSku.toLowerCase())}`);
          continue;
        }

        // ── Diff the sheet row against what is stored ─────────────────────
        const { values, changes, errors: rowErrors } = buildProductPayload(row, columns, product);
        if (rowErrors.length > 0) {
          fail(rowErrors.join('; '));
          continue;
        }

        if (product && values.sku && values.sku !== product.sku) {
          const clash = await Product.findOne({
            where: { sku: values.sku, id: { [Op.ne]: product.id } },
            transaction,
          });
          if (clash) {
            fail(`SKU '${values.sku}' is already used by product #${clash.id}`);
            continue;
          }
        }

        const incomingImages = resolveImages(row, columns);

        // ── Create ────────────────────────────────────────────────────────
        if (!product) {
          const created = await Product.create(values, { transaction });
          if (incomingImages) await writeProductImages(created.id, incomingImages, transaction);

          counts.added += 1;
          seenProductRows.set(created.id, rowNum);
          seenSkuRows.set(created.sku.toLowerCase(), rowNum);
          results.push({ row: rowNum, id: created.id, sku: created.sku, name: created.name, status: 'added', changes: [] });
          continue;
        }

        seenProductRows.set(product.id, rowNum);
        seenSkuRows.set(product.sku.toLowerCase(), rowNum);

        let imagesChanged = false;
        if (incomingImages) {
          const currentImages = await readProductImageUrls(product.id, transaction);
          imagesChanged = !sameOrderedList(currentImages, incomingImages);
        }

        const changedColumns = imagesChanged ? [...changes, 'images'] : changes;

        // ── Nothing to do ─────────────────────────────────────────────────
        if (changedColumns.length === 0) {
          counts.unchanged += 1;
          results.push({
            row: rowNum,
            id: product.id,
            sku: product.sku,
            name: product.name,
            status: 'unchanged',
            changes: [],
          });
          continue;
        }

        // ── Update only what differs ──────────────────────────────────────
        if (Object.keys(values).length > 0) await product.update(values, { transaction });
        if (imagesChanged) {
          // Rows are replaced but the old S3 objects are left in place — a bulk
          // sheet is too blunt an instrument to delete artwork irreversibly.
          await ProductImage.destroy({ where: { product_id: product.id }, transaction, force: true });
          await writeProductImages(product.id, incomingImages, transaction);
        }

        counts.updated += 1;
        results.push({
          row: rowNum,
          id: product.id,
          sku: product.sku,
          name: product.name,
          status: 'updated',
          changes: changedColumns,
        });
      } catch (err) {
        const detail = err.errors ? err.errors.map((e) => e.message).join(', ') : (err.message || String(err));
        console.error(`Bulk import: row ${rowNum} (sku ${rowSku || 'n/a'}) failed:`, detail);
        fail(detail);
      }
    }

    await transaction.commit();

    // success_count keeps its "rows processed without error" meaning, so
    // success_count + error_count still equals total_rows in the log table.
    await importLog.update({
      success_count: counts.added + counts.updated + counts.unchanged,
      error_count: counts.failed,
      errors_json: errors.length > 0 ? errors : null,
      status: rows.length > 0 && counts.failed === rows.length ? 'failed' : 'completed',
    });
    await importLog.reload();

    return {
      ...importLog.toJSON(),
      added_count: counts.added,
      updated_count: counts.updated,
      unchanged_count: counts.unchanged,
      failed_count: counts.failed,
      results: results.slice(0, IMPORT_DETAIL_CAP),
      results_truncated: results.length > IMPORT_DETAIL_CAP,
    };
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

/**
 * Bulk update product status
 */
async function bulkUpdateStatus(productIds, isActive) {
  await Product.update(
    { is_active: isActive },
    { where: { id: { [Op.in]: productIds } } }
  );
  return { message: `${productIds.length} products updated` };
}

/**
 * Bulk delete products
 */
async function bulkDeleteProducts(productIds) {
  const transaction = await sequelize.transaction();
  try {
    const products = await Product.findAll({ where: { id: { [Op.in]: productIds } }, transaction });
    if (products.length === 0) return { message: 'No products found' };

    const productImages = await ProductImage.findAll({ where: { product_id: { [Op.in]: productIds } }, transaction });
    const urls = productImages.map(img => img.image_url);

    if (urls.length > 0) {
      await ProductImage.destroy({ where: { product_id: { [Op.in]: productIds } }, transaction, force: true });
    }

    await Product.destroy({ where: { id: { [Op.in]: productIds } }, transaction, force: true });

    await transaction.commit();

    if (urls.length > 0) {
      deleteFromS3(urls).catch(err => console.error('Failed to delete S3 images on bulk delete', err));
    }

    return { message: `${products.length} products deleted` };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Bulk update stock
 */
async function bulkUpdateStock(productIds, stockValue, updateType = 'set') {
  if (updateType === 'add') {
    await Product.increment('stock', {
      by: parseInt(stockValue, 10),
      where: { id: { [Op.in]: productIds } }
    });
  } else {
    await Product.update(
      { stock: parseInt(stockValue, 10) },
      { where: { id: { [Op.in]: productIds } } }
    );
  }
  return { message: `${productIds.length} products stock updated` };
}

/**
 * Bulk update bestseller flag
 */
async function bulkUpdateBestseller(productIds, isBestSeller) {
  await Product.update(
    { is_best: isBestSeller },
    { where: { id: { [Op.in]: productIds } } }
  );
  return { message: `${productIds.length} products updated as bestseller` };
}

module.exports = {
  createProduct,
  updateProduct,
  getProductById,
  getProductBySlug,
  listProducts,
  toggleProductStatus,
  toggleFeaturedStatus,
  deleteProduct,
  getCategories,
  getBrands,
  getSymptoms,
  bulkImport,
  exportProducts,
  getBestProducts,
  getProductsByBrand,
  getProductsByCategory,
  bulkUpdateStatus,
  bulkDeleteProducts,
  bulkUpdateStock,
  bulkUpdateBestseller,
};
