const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  ApiResponse.created(res, 'Registration successful. Please verify your email.', result);
});

exports.login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  ApiResponse.success(res, 'Login successful', result);
});

exports.googleLogin = catchAsync(async (req, res) => {
  const result = await authService.googleLogin(req.body.idToken);
  ApiResponse.success(res, 'Google login successful', result);
});

exports.refreshToken = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAccessToken(req.body.refreshToken);
  ApiResponse.success(res, 'Token refreshed', tokens);
});

exports.verifyEmail = catchAsync(async (req, res) => {
  const result = await authService.verifyEmail(req.query.token);
  ApiResponse.success(res, result.message);
});

exports.forgotPassword = catchAsync(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  ApiResponse.success(res, result.message);
});

exports.resetPassword = catchAsync(async (req, res) => {
  const result = await authService.resetPassword(req.body.token, req.body.password);
  ApiResponse.success(res, result.message);
});

exports.changePassword = catchAsync(async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.body);
  ApiResponse.success(res, result.message);
});
