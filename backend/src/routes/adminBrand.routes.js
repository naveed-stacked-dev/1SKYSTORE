const router = require('express').Router();
const ctrl = require('../controllers/adminBrand.controller');
const { authenticateAdmin } = require('../middlewares/auth');
const { uploadSingleImageMemory } = require('../middlewares/upload');

router.use(authenticateAdmin);

// Set the S3 folder for brand images
const setBrandFolder = (req, res, next) => {
  req.uploadFolder = 'brands';
  next();
};

// GET    /api/v1/admin/brands          → list all brands
router.get('/', ctrl.listBrands);

// GET    /api/v1/admin/brands/:id      → get single brand
router.get('/:id', ctrl.getBrand);

// POST   /api/v1/admin/brands          → create brand (with optional image)
router.post('/', uploadSingleImageMemory, ctrl.createBrand);

// PUT    /api/v1/admin/brands/:id      → update brand
router.put('/:id', uploadSingleImageMemory, ctrl.updateBrand);

// PATCH  /api/v1/admin/brands/:id/toggle → toggle active status
router.patch('/:id/toggle', ctrl.toggleBrand);

// DELETE /api/v1/admin/brands/:id      → delete brand
router.delete('/:id', ctrl.deleteBrand);

module.exports = router;
