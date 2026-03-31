const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const authValidation = require('../validations/auth.validation');

const { authenticateUser } = require('../middlewares/auth');

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/google', validate(authValidation.googleLogin), authController.googleLogin);
router.post('/refresh', validate(authValidation.refreshToken), authController.refreshToken);
router.get('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.post('/change-password', authenticateUser, validate(authValidation.changePassword), authController.changePassword);

module.exports = router;
