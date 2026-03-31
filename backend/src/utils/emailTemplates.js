const BRAND_COLOR = '#4CAF50';
const SECONDARY_COLOR = '#3182CE';
const TEXT_COLOR = '#2d3748';
const METADATA_COLOR = '#718096';

/**
 * Base Template Wrapper
 */
function baseTemplate(content) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: ${BRAND_COLOR}; margin: 0;">HomeoPathy</h1>
      </div>
      <div>
        ${content}
      </div>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="color: ${METADATA_COLOR}; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} HomeoPathy. All rights reserved.</p>
        <p style="color: ${METADATA_COLOR}; font-size: 12px; margin: 5px 0 0 0;">This email was sent automatically, please do not reply.</p>
      </div>
    </div>
  `;
}

/**
 * Email Verification
 */
function verificationTemplate(name, verifyUrl) {
  const content = `
    <h2 style="color: ${TEXT_COLOR};">Welcome to HomeoPathy!</h2>
    <p>Hi ${name || 'there'},</p>
    <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verifyUrl}" style="background-color: ${BRAND_COLOR}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
        Verify Email
      </a>
    </div>
    <p>Verify Email by clicking the link below if button is not working</p>
    <p style="color: ${METADATA_COLOR}; font-size: 16px; display: inline-block;">
        ${verifyUrl}
    </p>
    <p style="color: ${METADATA_COLOR}; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
    <p style="color: ${METADATA_COLOR}; font-size: 12px;">This link expires in 24 hours.</p>
  `;
  return baseTemplate(content);
}

/**
 * Forgot Password (Reset Password)
 */
function passwordResetTemplate(name, resetUrl) {
  const content = `
    <h2 style="color: ${TEXT_COLOR};">Password Reset Request</h2>
    <p>Hi ${name || 'there'},</p>
    <p>You recently requested a password reset for your account. Click the button below to set a new password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background-color: ${SECONDARY_COLOR}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
        Reset Password
      </a>
    </div>
    <p>Reset Password by clicking the link below if button is not working</p>
    <p style="color: ${METADATA_COLOR}; font-size: 16px; display: inline-block;">
        ${resetUrl}
    </p>
    <p style="color: ${METADATA_COLOR}; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
    <p style="color: ${METADATA_COLOR}; font-size: 12px;">This reset link expires in 1 hour.</p>
  `;
  return baseTemplate(content);
}

/**
 * Welcome Email (After Verification)
 */
function welcomeTemplate(name) {
  const content = `
    <h2 style="color: ${TEXT_COLOR};">You're all set! 🎉</h2>
    <p>Hi ${name || 'there'},</p>
    <p>Your email has been successfully verified.</p>
    <p>We are thrilled to have you on board with HomeoPathy. You can now log into your account and start exploring our wide range of products tailored for your holistic wellness journey.</p>
    <p>Best Regards,<br>The HomeoPathy Team</p>
  `;
  return baseTemplate(content);
}

/**
 * Order Confirmation
 */
function orderConfirmationTemplate(name, order) {
  const content = `
    <h2 style="color: ${TEXT_COLOR};">Order Confirmed! 🎉</h2>
    <p>Hi ${name || 'there'},</p>
    <p>Thank you for shopping with us! Your order <strong>#${order.order_number}</strong> has been confirmed.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
      <tr style="background: #f7fafc;">
        <td style="padding: 10px; border: 1px solid #e2e8f0; width: 40%;"><strong>Order Number</strong></td>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">${order.order_number}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Total Amount</strong></td>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">${order.currency} ${order.total_amount}</td>
      </tr>
      <tr style="background: #f7fafc;">
        <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Payment Status</strong></td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-transform: capitalize;">${order.payment_status}</td>
      </tr>
    </table>
    <p>We'll send you another email as soon as your order ships.</p>
  `;
  return baseTemplate(content);
}

/**
 * Payment Success
 */
function paymentSuccessTemplate(name, payment) {
  const content = `
    <h2 style="color: ${TEXT_COLOR};">Payment Received ✅</h2>
    <p>Hi ${name || 'there'},</p>
    <p>We've successfully received your payment of <strong>${payment.currency} ${payment.amount}</strong>.</p>
    <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Payment Details:</strong></p>
      <p style="margin: 5px 0; font-size: 14px; color: #4a5568;">Provider: ${payment.provider.toUpperCase()}</p>
      <p style="margin: 5px 0; font-size: 14px; color: #4a5568;">Transaction ID: ${payment.provider_payment_id || payment.provider_order_id}</p>
    </div>
    <p>Your order is now processing.</p>
  `;
  return baseTemplate(content);
}

/**
 * Order Status Update
 */
function orderStatusUpdateTemplate(name, order) {
  const content = `
    <h2 style="color: ${TEXT_COLOR};">Order Status Update 📝</h2>
    <p>Hi ${name || 'there'},</p>
    <p>We have an update regarding your order <strong>#${order.order_number}</strong>.</p>
    <p>The status of your order has been updated to: <span style="background-color: ${SECONDARY_COLOR}; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; text-transform: capitalize; font-size: 14px;">${order.order_status}</span></p>
    <p>Log in to your account at any time to view your full order history and details.</p>
  `;
  return baseTemplate(content);
}

/**
 * Shipment Tracking Update
 */
function shipmentUpdateTemplate(name, shipment) {
  const content = `
    <h2 style="color: ${TEXT_COLOR};">Shipment Update 📦</h2>
    <p>Hi ${name || 'there'},</p>
    <p>Your shipment status has been updated to: <strong>${shipment.status.replace(/_/g, ' ').toUpperCase()}</strong></p>
    <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px;">
      ${shipment.courier_name ? `<p style="margin: 5px 0;"><strong>Courier:</strong> ${shipment.courier_name}</p>` : ''}
      ${shipment.awb_code ? `<p style="margin: 5px 0;"><strong>Tracking Number (AWB):</strong> ${shipment.awb_code}</p>` : ''}
    </div>
    ${shipment.tracking_url ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${shipment.tracking_url}" style="background-color: ${SECONDARY_COLOR}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
          Track your shipment
        </a>
      </div>
    ` : ''}
  `;
  return baseTemplate(content);
}

/**
 * Password Changed Successfully
 */
function passwordChangedTemplate(name) {
  const content = `
    <h2 style="color: ${TEXT_COLOR};">Password Changed Successfully ✅</h2>
    <p>Hi ${name || 'there'},</p>
    <p>This is a confirmation that the password for your HomeoPathy account has been successfully changed.</p>
    <p>If you did not make this change, please contact our support team immediately to secure your account.</p>
    <p>Best Regards,<br>The HomeoPathy Team</p>
  `;
  return baseTemplate(content);
}

module.exports = {
  verificationTemplate,
  passwordResetTemplate,
  welcomeTemplate,
  orderConfirmationTemplate,
  paymentSuccessTemplate,
  orderStatusUpdateTemplate,
  shipmentUpdateTemplate,
  passwordChangedTemplate,
};
