const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const validate = require('../middlewares/validate');
const authValidation = require('../validations/auth.validation');

router.post('/login', validate(authValidation.login), adminController.adminLogin);
router.post('/register', validate(authValidation.adminRegister), adminController.createAdmin);

module.exports = router;
