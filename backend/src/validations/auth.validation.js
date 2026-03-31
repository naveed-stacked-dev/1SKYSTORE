const Joi = require('joi');

const register = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
    first_name: Joi.string().max(100).optional(),
    last_name: Joi.string().max(100).optional(),
    phone: Joi.string().max(20).optional(),
  }),
};

const login = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const googleLogin = {
  body: Joi.object({
    idToken: Joi.string().required(),
  }),
};

const refreshToken = {
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  body: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).max(128).required(),
  }),
};

const verifyEmail = {
  query: Joi.object({
    token: Joi.string().required(),
  }),
};

const changePassword = {
  body: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required(),
  }),
};

const adminRegister = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
    first_name: Joi.string().max(100).required(),
    last_name: Joi.string().max(100).optional(),
    role: Joi.string().valid('super_admin', 'manager').optional(),
    permissions: Joi.array().items(Joi.string()).optional(),
  }),
};

module.exports = { register, login, googleLogin, refreshToken, forgotPassword, resetPassword, verifyEmail, changePassword, adminRegister };
