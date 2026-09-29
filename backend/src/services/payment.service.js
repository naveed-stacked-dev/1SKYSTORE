const stripe = require('../config/stripe');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const { Payment, Order, User } = require('../models');
const ApiError = require('../utils/ApiError');
const emailService = require('./email.service');

// ─── STRIPE (International / USD) ────────────────────────────────────────────

/**
 * Create Stripe Payment Intent
 */
async function createStripePaymentIntent(orderId, amount, currency = 'usd', metadata = {}) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe uses cents
    currency: currency.toLowerCase(),
    metadata: { order_id: orderId.toString(), ...metadata },
  });

  // Log payment record
  await Payment.create({
    order_id: orderId,
    provider: 'stripe',
    provider_payment_id: paymentIntent.id,
    amount,
    currency: currency.toUpperCase(),
    status: 'created',
    raw_response: paymentIntent,
  });

  return {
    client_secret: paymentIntent.client_secret,
    payment_intent_id: paymentIntent.id,
  };
}

/**
 * Verify Stripe payment
 */
async function verifyStripePayment(paymentIntentId) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const payment = await Payment.findOne({
    where: { provider_payment_id: paymentIntentId, provider: 'stripe' },
    include: [
      {
        model: Order,
        as: 'order',
        include: [{ model: User, as: 'user', attributes: ['email', 'first_name'] }],
      },
    ],
  });
  if (!payment) throw ApiError.notFound('Payment record not found');

  let status = 'failed';
  if (paymentIntent.status === 'succeeded') status = 'captured';
  else if (paymentIntent.status === 'requires_capture') status = 'authorized';

  await payment.update({
    status,
    payment_method: paymentIntent.payment_method_types?.[0] || 'card',
    raw_response: paymentIntent,
  });

  if (status === 'captured' && payment.order && payment.order.user) {
    emailService.sendPaymentSuccess(payment.order.user.email, payment.order.user.first_name, payment).catch(() => {});
  }

  return {
    verified: paymentIntent.status === 'succeeded',
    status: paymentIntent.status,
    order_id: payment.order_id,
    payment,
  };
}

// ─── RAZORPAY (India / INR) ─────────────────────────────────────────────────

/**
 * Create Razorpay order
 */
async function createRazorpayOrder(orderId, amount, currency = 'INR', notes = {}) {
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100), // Razorpay uses paise
    currency: currency.toUpperCase(),
    receipt: `order_${orderId}`,
    notes: { order_id: orderId.toString(), ...notes },
  });

  await Payment.create({
    order_id: orderId,
    provider: 'razorpay',
    provider_order_id: razorpayOrder.id,
    amount,
    currency: currency.toUpperCase(),
    status: 'created',
    raw_response: razorpayOrder,
  });

  return {
    razorpay_order_id: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key_id: process.env.RAZORPAY_KEY_ID,
  };
}

/**
 * Verify Razorpay payment signature
 */
async function verifyRazorpayPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  const isValid = expectedSignature === razorpay_signature;

  const payment = await Payment.findOne({
    where: { provider_order_id: razorpay_order_id, provider: 'razorpay' },
    include: [
      {
        model: Order,
        as: 'order',
        include: [{ model: User, as: 'user', attributes: ['email', 'first_name'] }],
      },
    ],
  });
  if (!payment) throw ApiError.notFound('Payment record not found');

  if (isValid) {
    // Fetch payment details from Razorpay
    let paymentDetails = {};
    try {
      paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (e) {
      // Non-critical
    }

    await payment.update({
      provider_payment_id: razorpay_payment_id,
      status: 'captured',
      payment_method: paymentDetails.method || 'unknown',
      raw_response: paymentDetails,
    });
    
    if (payment.order && payment.order.user) {
      emailService.sendPaymentSuccess(payment.order.user.email, payment.order.user.first_name, payment).catch(() => {});
    }
  } else {
    await payment.update({ status: 'failed' });
  }

  return {
    verified: isValid,
    order_id: payment.order_id,
    payment,
  };
}

module.exports = {
  createStripePaymentIntent,
  verifyStripePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
};
