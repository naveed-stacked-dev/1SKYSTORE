const cartService = require('../services/cart.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  ApiResponse.success(res, 'Cart fetched', cart);
});

exports.addToCart = catchAsync(async (req, res) => {
  const { product_id, quantity } = req.body;
  const cart = await cartService.addToCart(req.user.id, product_id, quantity || 1);
  ApiResponse.success(res, 'Item added to cart', cart);
});

exports.updateCartItem = catchAsync(async (req, res) => {
  const { product_id, quantity } = req.body;
  const cart = await cartService.updateCartItem(req.user.id, product_id, quantity);
  ApiResponse.success(res, 'Cart item updated', cart);
});

exports.removeFromCart = catchAsync(async (req, res) => {
  const cart = await cartService.removeFromCart(req.user.id, parseInt(req.params.productId));
  ApiResponse.success(res, 'Item removed from cart', cart);
});

exports.clearCart = catchAsync(async (req, res) => {
  const cart = await cartService.clearCart(req.user.id);
  ApiResponse.success(res, 'Cart cleared', cart);
});
