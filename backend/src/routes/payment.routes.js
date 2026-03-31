const router = require('express').Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

// Stripe endpoints
router.post('/stripe/create-intent', paymentController.createStripeIntent);
router.post('/stripe/verify', paymentController.verifyStripePayment);

// Razorpay endpoints
router.post('/razorpay/create-order', paymentController.createRazorpayOrder);
router.post('/razorpay/verify', paymentController.verifyRazorpayPayment);

module.exports = router;
