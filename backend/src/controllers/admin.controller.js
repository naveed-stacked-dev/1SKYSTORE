const adminService = require('../services/admin.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.adminLogin = catchAsync(async (req, res) => {
  const result = await adminService.adminLogin(req.body);
  ApiResponse.success(res, 'Admin login successful', result);
});

exports.createAdmin = catchAsync(async (req, res) => {
  const admin = await adminService.createAdmin(req.body);
  ApiResponse.created(res, 'Admin created successfully', admin);
});

exports.listAdmins = catchAsync(async (req, res) => {
  const admins = await adminService.listAdmins();
  ApiResponse.success(res, 'Admins fetched', admins);
});

exports.updateAdmin = catchAsync(async (req, res) => {
  const admin = await adminService.updateAdmin(req.params.id, req.body);
  ApiResponse.success(res, 'Admin updated', admin);
});

exports.changePassword = catchAsync(async (req, res) => {
  await adminService.changePassword(req.admin.id, req.body);
  ApiResponse.success(res, 'Password changed successfully');
});
