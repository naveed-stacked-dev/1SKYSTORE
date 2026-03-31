const shipmentService = require('../services/shipment.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.calculateShipping = catchAsync(async (req, res) => {
  const result = await shipmentService.calculateShipping(req.body);
  ApiResponse.success(res, 'Shipping rates fetched', result);
});

exports.createShipment = catchAsync(async (req, res) => {
  const shipment = await shipmentService.createShipment(req.body.order_id);
  ApiResponse.created(res, 'Shipment created', shipment);
});

exports.trackShipment = catchAsync(async (req, res) => {
  const result = await shipmentService.trackShipment(req.params.shipmentId);
  ApiResponse.success(res, 'Tracking info fetched', result);
});

exports.generateAwb = catchAsync(async (req, res) => {
  const { shipment_id, courier_id } = req.body;
  const shipment = await shipmentService.generateAwb(shipment_id, courier_id);
  ApiResponse.success(res, 'AWB generated', shipment);
});
