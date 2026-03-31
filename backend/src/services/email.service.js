const transporter = require('../config/email');
const templates = require('../utils/emailTemplates');

const EMAIL_FROM = process.env.EMAIL_FROM || 'HomeoPathy <noreply@homeopathy.com>';

/**
 * Send email helper
 */
async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email send error:', error.message);
    // Don't throw — email failures shouldn't block operations
  }
}

/**
 * Send email verification
 */
async function sendVerificationEmail(email, name, verifyUrl) {
  const subject = 'Verify your email - HomeoPathy';
  const html = templates.verificationTemplate(name, verifyUrl);
  await sendEmail(email, subject, html);
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(email, name, resetUrl) {
  const subject = 'Reset your password - HomeoPathy';
  const html = templates.passwordResetTemplate(name, resetUrl);
  await sendEmail(email, subject, html);
}

/**
 * Send welcome email (post verification)
 */
async function sendWelcomeEmail(email, name) {
  const subject = 'Welcome to HomeoPathy! 🎉';
  const html = templates.welcomeTemplate(name);
  await sendEmail(email, subject, html);
}

/**
 * Send order confirmation email
 */
async function sendOrderConfirmation(email, name, order) {
  const subject = `Order Confirmed #${order.order_number} - HomeoPathy`;
  const html = templates.orderConfirmationTemplate(name, order);
  await sendEmail(email, subject, html);
}

/**
 * Send payment success email
 */
async function sendPaymentSuccess(email, name, payment) {
  const subject = `Payment Received - HomeoPathy`;
  const html = templates.paymentSuccessTemplate(name, payment);
  await sendEmail(email, subject, html);
}

/**
 * Send order status update email
 */
async function sendOrderStatusUpdate(email, name, order) {
  const subject = `Order Update #${order.order_number} - HomeoPathy`;
  const html = templates.orderStatusUpdateTemplate(name, order);
  await sendEmail(email, subject, html);
}

/**
 * Send shipment update email
 */
async function sendShipmentUpdate(email, name, shipment) {
  const subject = `Shipment Update - HomeoPathy`;
  const html = templates.shipmentUpdateTemplate(name, shipment);
  await sendEmail(email, subject, html);
}

/**
 * Send password changed notification email
 */
async function sendPasswordChangedEmail(email, name) {
  const subject = 'Password Changed Successfully - HomeoPathy';
  const html = templates.passwordChangedTemplate(name);
  await sendEmail(email, subject, html);
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendPaymentSuccess,
  sendOrderStatusUpdate,
  sendShipmentUpdate,
  sendPasswordChangedEmail,
};
