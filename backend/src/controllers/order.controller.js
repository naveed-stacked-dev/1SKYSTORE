const orderService = require('../services/order.service');
const shipmentService = require('../services/shipment.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const { buildWorkbookBuffer, sendWorkbook } = require('../utils/exportUtils');

// Fixed column order for the order export sheet
const ORDER_EXPORT_HEADERS = [
  'order_number', 'order_date', 'customer_name', 'customer_email', 'phone',
  'order_status', 'payment_status', 'payment_provider', 'currency',
  'subtotal', 'discount', 'coupon_code', 'shipping_charge',
  'cgst', 'sgst', 'igst', 'tax', 'total_amount',
  'items_count', 'items',
  'shipping_address', 'city', 'state', 'postal_code', 'country',
  'courier', 'awb_code', 'shipment_status', 'estimated_delivery', 'notes',
];

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
  let result = await orderService.adminListOrders(req.query);

  // Refresh in-transit shipments on this page, then re-read so statuses are live
  const refreshed = await shipmentService.syncOrderShipments(result.orders.map((o) => o.id));
  if (refreshed) result = await orderService.adminListOrders(req.query);

  ApiResponse.paginated(res, 'Orders fetched', result.orders, result.pagination);
});

exports.exportOrders = catchAsync(async (req, res) => {
  const rows = await orderService.exportOrders(req.query);
  const buffer = buildWorkbookBuffer(rows, 'Orders', ORDER_EXPORT_HEADERS);
  return sendWorkbook(res, 'orders', buffer);
});

exports.adminGetOrder = catchAsync(async (req, res) => {
  // Pull the latest courier status so admins never see stale shipment info
  await shipmentService.syncOrderShipment(req.params.id);
  const order = await orderService.getOrderById(req.params.id);
  ApiResponse.success(res, 'Order fetched', order);
});

exports.updateOrderStatus = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.order_status);
  ApiResponse.success(res, 'Order status updated', order);
});
