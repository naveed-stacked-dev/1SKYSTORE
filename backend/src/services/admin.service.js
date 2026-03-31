const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { Admin, RefreshToken } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Admin login
 */
async function adminLogin({ email, password }) {
  const admin = await Admin.findOne({ where: { email } });
  if (!admin) throw ApiError.unauthorized('Invalid email or password');
  if (!admin.is_active) throw ApiError.forbidden('Account is deactivated');

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

  const payload = { id: admin.id, email: admin.email, type: 'admin', role: admin.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refreshTokenValue = jwt.sign(
    { ...payload, jti: uuidv4() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  await RefreshToken.create({
    token: refreshTokenValue,
    admin_id: admin.id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    admin: {
      id: admin.id,
      email: admin.email,
      first_name: admin.first_name,
      last_name: admin.last_name,
      role: admin.role,
      permissions: admin.permissions,
    },
    tokens: { accessToken, refreshToken: refreshTokenValue },
  };
}

/**
 * Create a new admin (super_admin only)
 */
async function createAdmin({ email, password, first_name, last_name, role, permissions }) {
  const existing = await Admin.findOne({ where: { email } });
  if (existing) throw ApiError.conflict('Email already registered');

  const admin = await Admin.create({
    email,
    password_hash: password,
    first_name,
    last_name,
    role: role || 'manager',
    permissions: permissions || [],
  });

  return {
    id: admin.id,
    email: admin.email,
    first_name: admin.first_name,
    last_name: admin.last_name,
    role: admin.role,
    permissions: admin.permissions,
  };
}

/**
 * List all admins
 */
async function listAdmins() {
  const admins = await Admin.findAll({
    attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'permissions', 'is_active', 'created_at'],
    order: [['created_at', 'DESC']],
  });
  return admins;
}

/**
 * Update admin
 */
async function updateAdmin(adminId, data) {
  const admin = await Admin.findByPk(adminId);
  if (!admin) throw ApiError.notFound('Admin not found');

  if (data.password) {
    data.password_hash = data.password;
    delete data.password;
  }

  await admin.update(data);

  return {
    id: admin.id,
    email: admin.email,
    first_name: admin.first_name,
    last_name: admin.last_name,
    role: admin.role,
    permissions: admin.permissions,
    is_active: admin.is_active,
  };
}

module.exports = { adminLogin, createAdmin, listAdmins, updateAdmin };
