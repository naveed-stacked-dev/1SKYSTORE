const addressService = require('../services/address.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.createAddress = catchAsync(async (req, res) => {
  const address = await addressService.createAddress(req.user.id, req.body);
  ApiResponse.created(res, 'Address created', address);
});

exports.getAddresses = catchAsync(async (req, res) => {
  const addresses = await addressService.getUserAddresses(req.user.id);
  ApiResponse.success(res, 'Addresses fetched', addresses);
});

exports.getAddress = catchAsync(async (req, res) => {
  const address = await addressService.getAddressById(req.user.id, req.params.id);
  ApiResponse.success(res, 'Address fetched', address);
});

exports.updateAddress = catchAsync(async (req, res) => {
  // console.log(req.body);
  // console.log(req.params.id);
  // console.log(req.user.id);
  const address = await addressService.updateAddress(req.user.id, req.params.id, req.body);
  ApiResponse.success(res, 'Address updated', address);
});

exports.deleteAddress = catchAsync(async (req, res) => {
  const result = await addressService.deleteAddress(req.user.id, req.params.id);
  ApiResponse.success(res, result.message);
});
