const paymentService = require('../services/payment.service');
const orderService = require('../services/order.service');
const emailService = require('../services/email.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const { User } = require('../models');

// ─── STRIPE ──────────────────────────────────────────────────────────────────

exports.createStripeIntent = catchAsync(async (req, res) => {
  const { order_id, amount, currency } = req.body;
  const result = await paymentService.createStripePaymentIntent(order_id, amount, currency);
  ApiResponse.success(res, 'Stripe payment intent created', result);
});

exports.verifyStripePayment = catchAsync(async (req, res) => {
  const { payment_intent_id } = req.body;
  const result = await paymentService.verifyStripePayment(payment_intent_id);

  if (result.verified) {
    await orderService.updatePaymentStatus(result.order_id, 'paid');
    // Send payment success email
    const order = await orderService.getOrderById(result.order_id);
    if (order?.user) {
      emailService.sendPaymentSuccess(order.user.email, order.user.first_name, result.payment).catch(() => {});
    }
  }

  ApiResponse.success(res, result.verified ? 'Payment verified' : 'Payment not verified', result);
});

// ─── RAZORPAY ────────────────────────────────────────────────────────────────

exports.createRazorpayOrder = catchAsync(async (req, res) => {
  const { order_id, amount, currency } = req.body;
  const result = await paymentService.createRazorpayOrder(order_id, amount, currency);
  ApiResponse.success(res, 'Razorpay order created', result);
});

exports.verifyRazorpayPayment = catchAsync(async (req, res) => {
  const result = await paymentService.verifyRazorpayPayment(req.body);

  if (result.verified) {
    await orderService.updatePaymentStatus(result.order_id, 'paid');
    const order = await orderService.getOrderById(result.order_id);
    if (order?.user) {
      emailService.sendPaymentSuccess(order.user.email, order.user.first_name, result.payment).catch(() => {});
    }
  }

  ApiResponse.success(res, result.verified ? 'Payment verified' : 'Payment verification failed', result);
});
