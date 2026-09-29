const router = require('express').Router();

// ─── AUTH ────────────────────────────────────────────────────────────────────
router.use('/auth', require('./auth.routes'));
router.use('/admin/auth', require('./adminAuth.routes'));

// ─── USERS ───────────────────────────────────────────────────────────────────
router.use('/users', require('./user.routes'));
router.use('/admin/admins', require('./admin.routes'));
router.use('/admin/users', require('./adminUser.routes'));

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
router.use('/products', require('./product.routes'));
router.use('/admin/products', require('./adminProduct.routes'));

// ─── CART & ADDRESS ──────────────────────────────────────────────────────────
router.use('/cart', require('./cart.routes'));
router.use('/addresses', require('./address.routes'));

// ─── ORDERS & PAYMENTS ───────────────────────────────────────────────────────
router.use('/orders', require('./order.routes'));
router.use('/admin/orders', require('./adminOrder.routes'));
router.use('/payments', require('./payment.routes'));

// ─── SHIPPING ────────────────────────────────────────────────────────────────
router.use('/shipping', require('./shipping.routes'));

// ─── MARKETING & ANALYTICS ───────────────────────────────────────────────────
router.use('/coupons', require('./coupon.routes'));
router.use('/admin/coupons', require('./adminCoupon.routes'));
router.use('/blogs', require('./blog.routes'));
router.use('/admin/blogs', require('./adminBlog.routes'));
router.use('/admin/analytics', require('./analytics.routes'));

// ─── UTILS ───────────────────────────────────────────────────────────────────
router.use('/upload', require('./upload.routes'));

// ─── BANNERS ─────────────────────────────────────────────────────────────────
router.use('/banners', require('./banner.routes'));
router.use('/admin/banners', require('./adminBanner.routes'));

// ─── BRANDS ──────────────────────────────────────────────────────────────────
router.use('/brands', require('./brand.routes'));
router.use('/admin/brands', require('./adminBrand.routes'));

module.exports = router;
