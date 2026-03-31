const router = require('express').Router();
const couponController = require('../controllers/coupon.controller');
const { authenticateUser } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const couponValidation = require('../validations/coupon.validation');

router.post('/apply', authenticateUser, validate(couponValidation.applyCoupon), couponController.applyCoupon);

module.exports = router;
