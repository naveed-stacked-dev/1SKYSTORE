const { Cart, CartItem, Product, ProductImage } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Get or create cart for user
 */
async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ where: { user_id: userId } });
  if (!cart) {
    cart = await Cart.create({ user_id: userId });
  }
  return cart;
}

/**
 * Get cart with items and product details
 */
async function getCart(userId) {
  const cart = await getOrCreateCart(userId);

  const cartWithItems = await Cart.findByPk(cart.id, {
    include: [{
      model: CartItem,
      as: 'items',
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'slug', 'sku', 'price_usd', 'price_inr', 'stock', 'is_active', 'brand', 'category'],
        include: [{
          model: ProductImage,
          as: 'images',
          attributes: ['image_url', 'is_primary'],
          where: { is_primary: true },
          required: false,
        }],
      }],
    }],
  });

  return cartWithItems;
}

/**
 * Add item to cart
 */
async function addToCart(userId, productId, quantity = 1) {
  const product = await Product.findByPk(productId);
  if (!product) throw ApiError.notFound('Product not found');
  if (!product.is_active) throw ApiError.badRequest('Product is not available');
  if (product.stock < quantity) throw ApiError.badRequest('Insufficient stock');

  const cart = await getOrCreateCart(userId);

  // Check if item already in cart
  let cartItem = await CartItem.findOne({
    where: { cart_id: cart.id, product_id: productId },
  });

  if (cartItem) {
    const newQuantity = cartItem.quantity + quantity;
    if (product.stock < newQuantity) throw ApiError.badRequest('Insufficient stock');
    cartItem.quantity = newQuantity;
    await cartItem.save();
  } else {
    cartItem = await CartItem.create({
      cart_id: cart.id,
      product_id: productId,
      quantity,
    });
  }

  return getCart(userId);
}

/**
 * Update cart item quantity
 */
async function updateCartItem(userId, productId, quantity) {
  const cart = await getOrCreateCart(userId);

  const cartItem = await CartItem.findOne({
    where: { cart_id: cart.id, product_id: productId },
  });
  if (!cartItem) throw ApiError.notFound('Item not in cart');

  if (quantity <= 0) {
    await cartItem.destroy({ force: true });
  } else {
    const product = await Product.findByPk(productId);
    if (product.stock < quantity) throw ApiError.badRequest('Insufficient stock');
    cartItem.quantity = quantity;
    await cartItem.save();
  }

  return getCart(userId);
}

/**
 * Remove item from cart
 */
async function removeFromCart(userId, productId) {
  const cart = await getOrCreateCart(userId);

  const cartItem = await CartItem.findOne({
    where: { cart_id: cart.id, product_id: productId },
  });
  if (!cartItem) throw ApiError.notFound('Item not in cart');

  await cartItem.destroy({ force: true });
  return getCart(userId);
}

/**
 * Clear entire cart
 */
async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  await CartItem.destroy({ where: { cart_id: cart.id }, force: true });
  return getCart(userId);
}

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
