const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');
const { User, RefreshToken } = require('../models');
const ApiError = require('../utils/ApiError');
const { encrypt, decrypt } = require('../utils/encryption');
const emailService = require('./email.service');

/**
 * Generate access + refresh token pair
 */
function generateTokens(payload) {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refreshTokenValue = jwt.sign(
    { ...payload, jti: uuidv4() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken: refreshTokenValue };
}

/**
 * Register a new user with email/password
 */
async function register({ email, password, first_name, last_name, phone }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw ApiError.conflict('Email already registered');

  const verificationToken = uuidv4();

  const user = await User.create({
    email,
    password_hash: password, // Will be hashed by beforeCreate hook
    first_name,
    last_name,
    phone_enc: phone ? encrypt(phone) : null,
    email_verification_token: verificationToken,
    is_verified: false,
  });

  // Send verification email
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  await emailService.sendVerificationEmail(user.email, user.first_name, verifyUrl);

  const tokens = generateTokens({ id: user.id, email: user.email, type: 'user' });

  // Store refresh token
  await RefreshToken.create({
    token: tokens.refreshToken,
    user_id: user.id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_verified: user.is_verified,
    },
    tokens,
  };
}

/**
 * Login with email/password
 */
async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

  if (!user.is_verified) {
    throw ApiError.forbidden('Please verify your email address before logging in.');
  }

  const tokens = generateTokens({ id: user.id, email: user.email, type: 'user' });

  await RefreshToken.create({
    token: tokens.refreshToken,
    user_id: user.id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_verified: user.is_verified,
    },
    tokens,
  };
}

/**
 * Google login via Firebase ID token
 */
async function googleLogin(idToken) {
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const { uid, email, name, picture } = decodedToken;

  let user = await User.findOne({ where: { firebase_uid: uid } });

  if (!user) {
    // Check if email already exists
    user = await User.findOne({ where: { email } });
    if (user) {
      // Link Firebase UID to existing user
      user.firebase_uid = uid;
      user.is_verified = true;
      await user.save();
    } else {
      // Create new user
      const [first_name, ...rest] = (name || '').split(' ');
      user = await User.create({
        email,
        firebase_uid: uid,
        first_name: first_name || '',
        last_name: rest.join(' ') || '',
        is_verified: true,
      });
    }
  }

  const tokens = generateTokens({ id: user.id, email: user.email, type: 'user' });

  await RefreshToken.create({
    token: tokens.refreshToken,
    user_id: user.id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_verified: user.is_verified,
    },
    tokens,
  };
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(refreshTokenValue) {
  const decoded = jwt.verify(refreshTokenValue, process.env.JWT_REFRESH_SECRET);

  const storedToken = await RefreshToken.findOne({
    where: { token: refreshTokenValue, is_revoked: false },
  });

  if (!storedToken) throw ApiError.unauthorized('Invalid refresh token');
  if (new Date(storedToken.expires_at) < new Date()) {
    await storedToken.update({ is_revoked: true });
    throw ApiError.unauthorized('Refresh token expired');
  }

  // Revoke old token
  await storedToken.update({ is_revoked: true });

  // Generate new token pair
  const payload = { id: decoded.id, email: decoded.email, type: decoded.type };
  const tokens = generateTokens(payload);

  await RefreshToken.create({
    token: tokens.refreshToken,
    user_id: decoded.type === 'user' ? decoded.id : null,
    admin_id: decoded.type === 'admin' ? decoded.id : null,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return tokens;
}

/**
 * Verify email with token
 */
async function verifyEmail(token) {
  const user = await User.findOne({ where: { email_verification_token: token } });
  if (!user) throw ApiError.badRequest('Invalid verification token');

  user.is_verified = true;
  user.email_verification_token = null;
  await user.save();

  // Send Welcome Email
  emailService.sendWelcomeEmail(user.email, user.first_name).catch(() => {});

  return { message: 'Email verified successfully' };
}

/**
 * Forgot password — send reset link
 */
async function forgotPassword(email) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw ApiError.notFound('User not found');

  const resetToken = uuidv4();
  user.password_reset_token = resetToken;
  user.password_reset_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await emailService.sendPasswordResetEmail(user.email, user.first_name, resetUrl);

  return { message: 'Password reset email sent' };
}

/**
 * Reset password with token
 */
async function resetPassword(token, newPassword) {
  const user = await User.findOne({
    where: { password_reset_token: token },
  });

  if (!user) throw ApiError.badRequest('Invalid reset token');
  if (new Date(user.password_reset_expires) < new Date()) {
    throw ApiError.badRequest('Reset token has expired');
  }

  user.password_hash = newPassword; // Will be hashed by beforeUpdate hook
  user.password_reset_token = null;
  user.password_reset_expires = null;
  await user.save();

  // Revoke all refresh tokens for security
  await RefreshToken.update(
    { is_revoked: true },
    { where: { user_id: user.id } }
  );

  // Send password changed notification email
  emailService.sendPasswordChangedEmail(user.email, user.first_name).catch(() => {});

  return { message: 'Password reset successful' };
}

/**
 * Change password for logged in user
 */
async function changePassword(userId, { oldPassword, newPassword }) {
  const user = await User.findByPk(userId);
  if (!user) throw ApiError.notFound('User not found');

  // Verify old password
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw ApiError.badRequest('Incorrect old password');

  // Set new password
  user.password_hash = newPassword; // Will be hashed by beforeUpdate hook
  await user.save();

  // Revoke all other sessions (refresh tokens) for security
  await RefreshToken.update(
    { is_revoked: true },
    { where: { user_id: userId } }
  );

  // Send password changed notification email
  emailService.sendPasswordChangedEmail(user.email, user.first_name).catch(() => {});

  return { message: 'Password changed successfully' };
}

module.exports = {
  register,
  login,
  googleLogin,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  generateTokens,
};
