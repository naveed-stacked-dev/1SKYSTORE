const orderService = require('../services/order.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// ─── USER ────────────────────────────────────────────────────────────────────

exports.createOrder = catchAsync(async (req, res) => {
  const result = await orderService.createOrder(req.user.id, req.body, req);
  ApiResponse.created(res, 'Order created', result);
});

exports.getUserOrders = catchAsync(async (req, res) => {
  const result = await orderService.getUserOrders(req.user.id, req.query);
  ApiResponse.paginated(res, 'Orders fetched', result.orders, result.pagination);
});

exports.getOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user.id);
  ApiResponse.success(res, 'Order fetched', order);
});

// ─── ADMIN ───────────────────────────────────────────────────────────────────

exports.adminListOrders = catchAsync(async (req, res) => {
  const result = await orderService.adminListOrders(req.query);
  ApiResponse.paginated(res, 'Orders fetched', result.orders, result.pagination);
});

exports.adminGetOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  ApiResponse.success(res, 'Order fetched', order);
});

exports.updateOrderStatus = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.order_status);
  ApiResponse.success(res, 'Order status updated', order);
});
