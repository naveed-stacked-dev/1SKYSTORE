const router = require('express').Router();
const couponController = require('../controllers/coupon.controller');
const { authenticateAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const couponValidation = require('../validations/coupon.validation');

router.use(authenticateAdmin);

router.post('/', validate(couponValidation.createCoupon), couponController.createCoupon);
router.get('/', couponController.listCoupons);
router.put('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
