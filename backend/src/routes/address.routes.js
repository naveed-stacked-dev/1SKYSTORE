const router = require('express').Router();
const addressController = require('../controllers/address.controller');
const { authenticateUser } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const addressValidation = require('../validations/address.validation');

router.use(authenticateUser);

router.post('/', validate(addressValidation.createAddress), addressController.createAddress);
router.get('/', addressController.getAddresses);
router.get('/:id', addressController.getAddress);
router.put('/:id', validate(addressValidation.updateAddress), addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);

module.exports = router;
