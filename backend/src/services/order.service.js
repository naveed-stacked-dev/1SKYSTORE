const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { Order, OrderItem, Cart, CartItem, Product, Address, Coupon, Payment, Shipment, User, ProductImage, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const paymentService = require('./payment.service');
const couponService = require('./coupon.service');
const emailService = require('./email.service');
const { detectCountry, getClientIp } = require('../utils/geoip');
const { decryptFields } = require('../utils/encryption');

/**
 * Generate unique order number
 */
function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().split('-')[0].toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Create order from cart
 */
async function createOrder(userId, { address_id, coupon_code, notes, payment_provider }, req) {
  const transaction = await sequelize.transaction();

  try {
    // 1. Get cart with items
    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{ model: Product, as: 'product' }],
      }],
      transaction,
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw ApiError.badRequest('Cart is empty');
    }

    // 2. Verify address
    const address = await Address.findOne({
      where: { id: address_id, user_id: userId },
      transaction,
    });
    if (!address) throw ApiError.notFound('Address not found');

    // 3. Detect country for pricing
    const clientIp = getClientIp(req);
    const { isIndia, currency } = detectCountry(clientIp);

    // 4. Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.is_active) {
        throw ApiError.badRequest(`Product '${product?.name || 'unknown'}' is no longer available`);
      }
      if (product.stock < item.quantity) {
        throw ApiError.badRequest(`Insufficient stock for '${product.name}'`);
      }

      const unitPrice = isIndia ? parseFloat(product.price_inr) : parseFloat(product.price_usd);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        currency,
      });
    }

    // 5. Apply coupon if provided
    let discount = 0;
    let coupon = null;
    if (coupon_code) {
      const cartBrands = cart.items.map((item) => item.product?.brand).filter(Boolean);
      const couponResult = await couponService.validateAndCalculateDiscount(coupon_code, subtotal, cartBrands, transaction);
      discount = couponResult.discount;
      coupon = couponResult.coupon;
    }

    // 6. Calculate tax (GST for India)
    let tax = 0, cgst = 0, sgst = 0, igst = 0;
    if (isIndia) {
      // Use average GST rate or product-level rates
      const avgGst = cart.items.reduce((sum, item) => {
        return sum + (parseFloat(item.product?.gst_percentage || 18));
      }, 0) / cart.items.length;

      tax = ((subtotal - discount) * avgGst) / 100;

      // If shipping within same state = CGST + SGST, else IGST
      // Simplified: use IGST for now (can be enhanced with seller state)
      igst = tax;
    }

    // 7. Shipping charge (placeholder — calculate via Shiprocket later)
    const shipping_charge = 0; // Will be updated when shipment is created

    // 8. Calculate total
    const total_amount = subtotal - discount + tax + shipping_charge;

    // 9. Create order
    const order = await Order.create({
      order_number: generateOrderNumber(),
      user_id: userId,
      address_id,
      subtotal,
      tax,
      cgst,
      sgst,
      igst,
      shipping_charge,
      discount,
      total_amount,
      currency,
      coupon_id: coupon?.id || null,
      coupon_code: coupon_code || null,
      payment_status: 'pending',
      order_status: 'pending',
      notes,
    }, { transaction });

    // 10. Create order items
    const itemsWithOrderId = orderItems.map((item) => ({ ...item, order_id: order.id }));
    await OrderItem.bulkCreate(itemsWithOrderId, { transaction });

    // 11. Deduct stock
    for (const item of cart.items) {
      await Product.update(
        { stock: sequelize.literal(`stock - ${item.quantity}`) },
        { where: { id: item.product_id }, transaction }
      );
    }

    // 12. Increment coupon usage
    if (coupon) {
      await Coupon.update(
        { used_count: sequelize.literal('used_count + 1') },
        { where: { id: coupon.id }, transaction }
      );
    }

    // 13. Clear cart
    await CartItem.destroy({ where: { cart_id: cart.id }, transaction, force: true });

    await transaction.commit();

    // 14. Create payment intent
    let paymentData;
    if (payment_provider === 'razorpay') {
      paymentData = await paymentService.createRazorpayOrder(order.id, total_amount, currency);
    } else {
      paymentData = await paymentService.createStripePaymentIntent(order.id, total_amount, currency);
    }

    // 15. Send order confirmation email
    const user = await User.findByPk(userId);
    if (user) {
      emailService.sendOrderConfirmation(user.email, user.first_name, order).catch(() => {});
    }

    return { order, paymentData };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Get user's orders
 */
async function getUserOrders(userId, query) {
  const { limit, offset, page, pageSize } = getPagination(query);

  const { count, rows } = await Order.findAndCountAll({
    where: { user_id: userId },
    include: [
      { model: OrderItem, as: 'items' },
      { model: Payment, as: 'payments', attributes: ['id', 'provider', 'status', 'amount', 'currency'] },
      { model: Shipment, as: 'shipment', attributes: ['id', 'status', 'awb_code', 'courier_name', 'tracking_url'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  return { orders: rows, pagination: getPaginationMeta(count, page, pageSize) };
}

/**
 * Get single order by ID (user must own it)
 */
async function getOrderById(orderId, userId = null) {
  const where = { id: orderId };
  if (userId) where.user_id = userId;

  const order = await Order.findOne({
    where,
    include: [
      {
        model: OrderItem, as: 'items',
        include: [{
          model: Product, as: 'product',
          include: [{ model: ProductImage, as: 'images', attributes: ['image_url', 'is_primary'], limit: 1 }],
        }],
      },
      { model: Payment, as: 'payments' },
      { model: Shipment, as: 'shipment' },
      { model: Address, as: 'address' },
      { model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] },
    ],
  });

  if (!order) throw ApiError.notFound('Order not found');

  // Decrypt address phone
  if (order.address) {
    const decrypted = decryptFields(order.address, ['phone_enc']);
    order.address.dataValues.phone = decrypted.phone_enc;
  }

  return order;
}

/**
 * Admin: List all orders with filtering
 */
async function adminListOrders(query) {
  const { limit, offset, page, pageSize } = getPagination(query);

  const where = {};
  if (query.payment_status) where.payment_status = query.payment_status;
  if (query.order_status) where.order_status = query.order_status;
  if (query.user_id) where.user_id = query.user_id;
  if (query.from_date || query.to_date) {
    where.created_at = {};
    if (query.from_date) where.created_at[Op.gte] = new Date(query.from_date);
    if (query.to_date) where.created_at[Op.lte] = new Date(query.to_date);
  }

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] },
      { model: OrderItem, as: 'items' },
      { model: Payment, as: 'payments', attributes: ['id', 'provider', 'status'] },
      { model: Shipment, as: 'shipment', attributes: ['id', 'status', 'awb_code'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  return { orders: rows, pagination: getPaginationMeta(count, page, pageSize) };
}

/**
 * Admin: Update order status
 */
async function updateOrderStatus(orderId, status) {
  const order = await Order.findByPk(orderId, {
    include: [{ model: User, as: 'user', attributes: ['email', 'first_name'] }],
  });
  if (!order) throw ApiError.notFound('Order not found');

  order.order_status = status;

  // Auto-update payment status if cancelled
  if (status === 'cancelled' && order.payment_status === 'pending') {
    order.payment_status = 'failed';
  }

  await order.save();

  // Send status update email
  if (order.user) {
    emailService.sendOrderStatusUpdate(order.user.email, order.user.first_name, order).catch(() => {});
  }

  return order;
}

/**
 * Update payment status after verification
 */
async function updatePaymentStatus(orderId, paymentStatus) {
  const order = await Order.findByPk(orderId);
  if (!order) throw ApiError.notFound('Order not found');

  order.payment_status = paymentStatus;
  if (paymentStatus === 'paid') {
    order.order_status = 'confirmed';
  }
  await order.save();

  return order;
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  adminListOrders,
  updateOrderStatus,
  updatePaymentStatus,
};
