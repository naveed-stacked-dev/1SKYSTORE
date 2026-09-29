const router = require('express').Router();
const ctrl = require('../controllers/brand.controller');

// GET /api/v1/brands → list public active brands
router.get('/', ctrl.listBrands);

module.exports = router;
