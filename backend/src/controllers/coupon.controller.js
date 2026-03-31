const couponService = require('../services/coupon.service');
const cartService = require('../services/cart.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const { detectCountry, getClientIp } = require('../utils/geoip');

// ─── ADMIN ───────────────────────────────────────────────────────────────────

exports.createCoupon = catchAsync(async (req, res) => {
  const coupon = await couponService.createCoupon(req.body);
  ApiResponse.created(res, 'Coupon created', coupon);
});

exports.updateCoupon = catchAsync(async (req, res) => {
  const coupon = await couponService.updateCoupon(req.params.id, req.body);
  ApiResponse.success(res, 'Coupon updated', coupon);
});

exports.deleteCoupon = catchAsync(async (req, res) => {
  const result = await couponService.deleteCoupon(req.params.id);
  ApiResponse.success(res, result.message);
});

exports.listCoupons = catchAsync(async (req, res) => {
  const result = await couponService.listCoupons(req.query);
  ApiResponse.paginated(res, 'Coupons fetched', result.coupons, result.pagination);
});

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

exports.applyCoupon = catchAsync(async (req, res) => {
  // Get cart to determine subtotal and brands
  const cart = await cartService.getCart(req.user.id);

  const { isIndia } = detectCountry(getClientIp(req));

  let subtotal = 0;
  const brands = [];

  if (cart?.items) {
    for (const item of cart.items) {
      const price = isIndia
        ? parseFloat(item.product?.price_inr || 0)
        : parseFloat(item.product?.price_usd || 0);
      subtotal += price * item.quantity;
      if (item.product?.brand) brands.push(item.product.brand);
    }
  }

  const result = await couponService.applyCoupon(req.body.code, subtotal, brands);
  ApiResponse.success(res, 'Coupon applied', result);
});
