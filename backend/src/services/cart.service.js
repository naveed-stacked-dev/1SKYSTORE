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
        attributes: ['id', 'name', 'slug', 'sku', 'price_usd', 'stock', 'is_active', 'brand', 'category'],
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

/**
 * Get cart with server-computed summary (subtotal, item totals)
 * This is the SINGLE SOURCE OF TRUTH for pricing
 */
async function getCartSummary(userId) {
  const cart = await getCart(userId);
  if (!cart || !cart.items || cart.items.length === 0) {
    return { cart, subtotal: 0, item_count: 0, items: [] };
  }

  let subtotal = 0;
  const enrichedItems = cart.items.map((item) => {
    const product = item.product;
    const unitPrice = parseFloat(product?.price_usd || 0);
    const lineTotal = unitPrice * (item.quantity || 1);
    subtotal += lineTotal;

    return {
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: unitPrice,
      line_total: Math.round(lineTotal * 100) / 100,
      product: product ? {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price_usd: unitPrice,
        stock: product.stock,
        brand: product.brand,
        category: product.category,
        image: product.images?.[0]?.image_url || null,
      } : null,
    };
  });

  return {
    cart_id: cart.id,
    subtotal: Math.round(subtotal * 100) / 100,
    item_count: enrichedItems.reduce((sum, i) => sum + i.quantity, 0),
    items: enrichedItems,
  };
}

module.exports = { getCart, getCartSummary, addToCart, updateCartItem, removeFromCart, clearCart };
