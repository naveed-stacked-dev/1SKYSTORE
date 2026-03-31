const { Op } = require('sequelize');
const { Coupon } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

/**
 * Create coupon (admin)
 */
async function createCoupon(data) {
  const existing = await Coupon.findOne({ where: { code: data.code.toUpperCase() } });
  if (existing) throw ApiError.conflict(`Coupon code '${data.code}' already exists`);

  data.code = data.code.toUpperCase();
  const coupon = await Coupon.create(data);
  return coupon;
}

/**
 * Update coupon (admin)
 */
async function updateCoupon(couponId, data) {
  const coupon = await Coupon.findByPk(couponId);
  if (!coupon) throw ApiError.notFound('Coupon not found');

  if (data.code) data.code = data.code.toUpperCase();
  await coupon.update(data);
  return coupon;
}

/**
 * Delete coupon (soft delete)
 */
async function deleteCoupon(couponId) {
  const coupon = await Coupon.findByPk(couponId);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  await coupon.destroy();
  return { message: 'Coupon deleted successfully' };
}

/**
 * List coupons (admin)
 */
async function listCoupons(query) {
  const { limit, offset, page, pageSize } = getPagination(query);

  const { count, rows } = await Coupon.findAndCountAll({
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return { coupons: rows, pagination: getPaginationMeta(count, page, pageSize) };
}

/**
 * Validate coupon and calculate discount
 * @param {string} code - Coupon code
 * @param {number} subtotal - Cart subtotal
 * @param {string[]} cartBrands - Brands present in cart
 * @param {Transaction} transaction - Optional Sequelize transaction
 */
async function validateAndCalculateDiscount(code, subtotal, cartBrands = [], transaction = null) {
  const findOptions = { where: { code: code.toUpperCase(), is_active: true } };
  if (transaction) findOptions.transaction = transaction;

  const coupon = await Coupon.findOne(findOptions);
  if (!coupon) throw ApiError.badRequest('Invalid coupon code');

  // Check dates
  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    throw ApiError.badRequest('Coupon is not yet active');
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    throw ApiError.badRequest('Coupon has expired');
  }

  // Check usage limit
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    throw ApiError.badRequest('Coupon usage limit reached');
  }

  // Check brand-specific coupon
  if (coupon.brand) {
    const brandMatch = cartBrands.some(
      (brand) => brand.toLowerCase() === coupon.brand.toLowerCase()
    );
    if (!brandMatch) {
      throw ApiError.badRequest(`Coupon is only valid for brand: ${coupon.brand}`);
    }
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (subtotal * parseFloat(coupon.discount_value)) / 100;
  } else {
    discount = parseFloat(coupon.discount_value);
  }

  // Discount cannot exceed subtotal
  discount = Math.min(discount, subtotal);

  return { coupon, discount: Math.round(discount * 100) / 100 };
}

/**
 * Apply coupon (public — returns discount preview)
 */
async function applyCoupon(code, subtotal, cartBrands) {
  const result = await validateAndCalculateDiscount(code, subtotal, cartBrands);
  return {
    code: result.coupon.code,
    discount_type: result.coupon.discount_type,
    discount_value: result.coupon.discount_value,
    discount: result.discount,
    brand: result.coupon.brand,   
  };
}

module.exports = {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listCoupons,
  validateAndCalculateDiscount,
  applyCoupon,
};
