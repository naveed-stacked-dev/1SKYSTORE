const router = require('express').Router();
const ctrl = require('../controllers/adminBanner.controller');
const { authenticateAdmin } = require('../middlewares/auth');
const { uploadMultiple } = require('../middlewares/upload');

router.use(authenticateAdmin);

// ─── Set the S3 folder BEFORE multer runs using query param ──────────────────
const setBannerFolder = (req, res, next) => {
  const type = req.query.type || 'hero';
  req.uploadFolder = `banners/${type}`;
  next();
};

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET   /api/v1/admin/banners?type=hero|info   → list banners (filtered)
router.get('/', ctrl.getBanners);

// POST  /api/v1/admin/banners/upload?type=hero|info  → upload images to S3 + save to DB
router.post('/upload', setBannerFolder, uploadMultiple, ctrl.uploadBanners);

// POST  /api/v1/admin/banners   → create via raw URL (legacy)
router.post('/', ctrl.createBanner);

// PUT   /api/v1/admin/banners/:id   → update metadata
router.put('/:id', ctrl.updateBanner);

// DELETE /api/v1/admin/banners/:id  → delete from S3 + DB
router.delete('/:id', ctrl.deleteBanner);

module.exports = router;
