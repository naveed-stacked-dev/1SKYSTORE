const router = require('express').Router();
const productController = require('../controllers/product.controller');
const { authenticateAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const productValidation = require('../validations/product.validation');
const { uploadExcel, uploadImageMemory } = require('../middlewares/upload');

router.use(authenticateAdmin);

const setProductFolder = (req, res, next) => {
  req.uploadFolder = 'products';
  next();
};

router.get('/', validate(productValidation.listProducts), productController.adminListProducts);
router.get('/:id', productController.adminGetProduct);
router.post('/', setProductFolder, uploadImageMemory, validate(productValidation.createProduct), productController.createProduct);
router.put('/:id', setProductFolder, uploadImageMemory, validate(productValidation.updateProduct), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.patch('/:id/toggle', productController.toggleProduct);
router.post('/bulk-import', uploadExcel, productController.bulkImport);

module.exports = router;
