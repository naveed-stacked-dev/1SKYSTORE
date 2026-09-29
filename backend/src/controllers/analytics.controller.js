const analyticsService = require('../services/analytics.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.getSales = catchAsync(async (req, res) => {
  const { period, from, to } = req.query;
  const result = await analyticsService.getSalesAnalytics(period, from, to);
  ApiResponse.success(res, 'Sales analytics fetched', result);
});

exports.getRevenue = catchAsync(async (req, res) => {
  const { from, to } = req.query;
  const result = await analyticsService.getRevenueSplit(from, to);
  ApiResponse.success(res, 'Revenue split fetched', result);
});

exports.getTopProducts = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const result = await analyticsService.getTopProducts(limit);
  ApiResponse.success(res, 'Top products fetched', result);
});

exports.getTopBrands = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const result = await analyticsService.getTopBrands(limit);
  ApiResponse.success(res, 'Top brands fetched', result);
});

exports.getUserGrowth = catchAsync(async (req, res) => {
  const { period } = req.query;
  const result = await analyticsService.getUserGrowth(period);
  ApiResponse.success(res, 'User growth fetched', result);
});

exports.getOrdersSummary = catchAsync(async (req, res) => {
  const result = await analyticsService.getOrdersSummary();
  ApiResponse.success(res, 'Orders summary fetched', result);
});

exports.getDashboard = catchAsync(async (req, res) => {
  const result = await analyticsService.getDashboard();
  ApiResponse.success(res, 'Dashboard fetched', result);
});
