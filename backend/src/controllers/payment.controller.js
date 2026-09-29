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

/**
 * Verify Razorpay payment
 * After successful verification:
 * 1. Update order payment status → paid
 * 2. Deduct stock, clear cart
 * 3. Create shipment in Shiprocket
 */
exports.verifyRazorpayPayment = catchAsync(async (req, res) => {
  const result = await paymentService.verifyRazorpayPayment(req.body);

  if (result.verified) {
    // 1. Update payment status
    await orderService.updatePaymentStatus(result.order_id, 'paid');

    // 2. Post-payment flow: deduct stock, clear cart, create shipment
    try {
      await orderService.confirmOrderAfterPayment(result.order_id);
    } catch (confirmErr) {
      // Log but don't fail — payment is already captured
      console.error(`[Payment] Post-payment confirmation failed for order ${result.order_id}:`, confirmErr.message);
    }

    // 3. Send payment success email
    try {
      const order = await orderService.getOrderById(result.order_id);
      if (order?.user) {
        emailService.sendPaymentSuccess(order.user.email, order.user.first_name, result.payment).catch(() => {});
      }
    } catch (emailErr) {
      // Non-critical
    }
  }

  ApiResponse.success(res, result.verified ? 'Payment verified' : 'Payment verification failed', result);
});
