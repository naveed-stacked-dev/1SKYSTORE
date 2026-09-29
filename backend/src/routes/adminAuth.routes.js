const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const validate = require('../middlewares/validate');
const { authenticateAdmin } = require('../middlewares/auth');
const authValidation = require('../validations/auth.validation');

router.post('/login', validate(authValidation.login), adminController.adminLogin);
router.post('/register', validate(authValidation.adminRegister), adminController.createAdmin);
router.post('/change-password', authenticateAdmin, validate(authValidation.changePassword), adminController.changePassword);

module.exports = router;
