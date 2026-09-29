import API from './axios';

const paymentService = {
  // Stripe
  stripeCreateIntent: (data) => API.post('/payments/stripe/create-intent', data),
  stripeVerify: (data) => API.post('/payments/stripe/verify', data),

  // Razorpay
  razorpayCreateOrder: (data) => API.post('/payments/razorpay/create-order', data),
  razorpayVerify: (data) => API.post('/payments/razorpay/verify', data),
};

export default paymentService;
