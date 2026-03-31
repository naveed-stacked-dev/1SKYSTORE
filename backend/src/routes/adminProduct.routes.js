const router = require('express').Router();
const productController = require('../controllers/product.controller');
const { authenticateAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const productValidation = require('../validations/product.validation');
const { uploadExcel } = require('../middlewares/upload');

router.use(authenticateAdmin);

router.get('/', validate(productValidation.listProducts), productController.adminListProducts);
router.get('/:id', productController.adminGetProduct);
router.post('/', validate(productValidation.createProduct), productController.createProduct);
router.put('/:id', validate(productValidation.updateProduct), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.patch('/:id/toggle', productController.toggleProduct);
router.post('/bulk-import', uploadExcel, productController.bulkImport);

module.exports = router;
