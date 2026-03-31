const router = require('express').Router();
const productController = require('../controllers/product.controller');
const validate = require('../middlewares/validate');
const productValidation = require('../validations/product.validation');

// Public product endpoints
router.get('/', validate(productValidation.listProducts), productController.listProducts);
router.get('/categories', productController.getCategories);
router.get('/brands', productController.getBrands);
router.get('/best', productController.getBestProducts);
router.get('/by-brand', productController.getProductsByBrand);
router.get('/by-category', productController.getProductsByCategory);
router.get('/:slug', productController.getProductBySlug);

module.exports = router;
