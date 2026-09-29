const shipmentService = require('../services/shipment.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * Calculate shipping rates for checkout
 * Accepts address_id, looks up postcode and cart weight automatically
 */
exports.calculateShipping = catchAsync(async (req, res) => {
  const { address_id, delivery_postcode, weight } = req.body;

  let result;
  if (address_id) {
    // Checkout flow: auto-calculate from address + cart
    result = await shipmentService.calculateShippingForCheckout(req.user.id, address_id);
  } else {
    // Direct calculation with postcode
    result = await shipmentService.calculateShipping({
      delivery_postcode,
      weight,
    });
  }

  ApiResponse.success(res, 'Shipping rates fetched', result);
});

exports.createShipment = catchAsync(async (req, res) => {
  const { order_id, courier_id } = req.body;
  const shipment = await shipmentService.createShipment(order_id, courier_id);
  ApiResponse.created(res, 'Shipment created', shipment);
});

exports.trackShipment = catchAsync(async (req, res) => {
  const result = await shipmentService.trackShipment(req.params.shipmentId, req.user.id);
  ApiResponse.success(res, 'Tracking info fetched', result);
});

exports.generateAwb = catchAsync(async (req, res) => {
  const { shipment_id, courier_id } = req.body;
  const shipment = await shipmentService.generateAwb(shipment_id, courier_id);
  ApiResponse.success(res, 'AWB generated', shipment);
});
