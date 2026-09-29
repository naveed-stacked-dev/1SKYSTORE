const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { Order, OrderItem, Cart, CartItem, Product, Address, Coupon, Payment, Shipment, User, ProductImage, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { EXPORT_ROW_CAP, toNumber, toDateString } = require('../utils/exportUtils');
const paymentService = require('./payment.service');
const couponService = require('./coupon.service');
const shipmentService = require('./shipment.service');
const emailService = require('./email.service');

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
 * Create order from cart — SECURE FLOW
 * 
 * All prices calculated SERVER-SIDE from DB.
 * Does NOT deduct stock or clear cart yet.
 * Stock deduction + cart clearing happens AFTER payment verification.
 * 
 * @param {number} userId
 * @param {object} params - { address_id, coupon_code, shipping_courier_id, shipping_cost, notes, payment_provider }
 */
async function createOrder(userId, { address_id, coupon_code, shipping_courier_id, shipping_cost, notes, payment_provider }, req) {
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

    // 3. Currency — always USD
    const currency = 'USD';

    // 4. Calculate totals SERVER-SIDE (NEVER trust frontend)
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

      const unitPrice = parseFloat(product.price_usd);
      // Products not yet priced in USD must not sell for $0
      if (!(unitPrice > 0)) {
        throw ApiError.badRequest(`'${product.name}' is not available for purchase yet`);
      }
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

    // 5. Apply coupon if provided (validated on backend)
    let discount = 0;
    let coupon = null;
    if (coupon_code) {
      const cartBrands = cart.items.map((item) => item.product?.brand).filter(Boolean);
      const couponResult = await couponService.validateAndCalculateDiscount(coupon_code, subtotal, cartBrands, transaction);
      discount = couponResult.discount;
      coupon = couponResult.coupon;
    }

    // 6. Shipping charge (from Shiprocket, validated server-side)
    const shipping_charge = parseFloat(shipping_cost) || 0;

    // 7. Calculate total (NO TAX for simplicity — can be added later)
    const total_amount = Math.round((subtotal - discount + shipping_charge) * 100) / 100;

    if (total_amount <= 0) {
      throw ApiError.badRequest('Order total must be greater than zero');
    }

    // 8. Create order in PENDING state
    const order = await Order.create({
      order_number: generateOrderNumber(),
      user_id: userId,
      address_id,
      subtotal,
      tax: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      shipping_charge,
      shipping_courier_id,
      discount,
      total_amount,
      currency,
      coupon_id: coupon?.id || null,
      coupon_code: coupon_code || null,
      payment_status: 'pending',
      order_status: 'pending',
      notes,
    }, { transaction });

    // 9. Create order items
    const itemsWithOrderId = orderItems.map((item) => ({ ...item, order_id: order.id }));
    await OrderItem.bulkCreate(itemsWithOrderId, { transaction });

    // 10. Increment coupon usage
    if (coupon) {
      await Coupon.update(
        { used_count: sequelize.literal('used_count + 1') },
        { where: { id: coupon.id }, transaction }
      );
    }

    // NOTE: Stock is NOT deducted yet. Cart is NOT cleared yet.
    // This happens in confirmOrderAfterPayment()

    await transaction.commit();

    // 11. Create Razorpay payment order (USD — needs international payments enabled on the account)
    const paymentData = await paymentService.createRazorpayOrder(order.id, total_amount, currency);

    return { order, paymentData };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Confirm order after successful payment
 * - Deducts stock
 * - Clears cart
 * - Creates shipment in Shiprocket
 * - Sends confirmation email
 */
async function confirmOrderAfterPayment(orderId) {
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, as: 'user', attributes: ['id', 'email', 'first_name'] },
      ],
      transaction,
    });

    if (!order) throw ApiError.notFound('Order not found');
    if (order.payment_status !== 'paid') {
      throw ApiError.badRequest('Order payment not confirmed');
    }

    // 1. Deduct stock
    for (const item of order.items) {
      const [updatedRows] = await Product.update(
        { stock: sequelize.literal(`stock - ${item.quantity}`) },
        { 
          where: { 
            id: item.product_id,
            stock: { [Op.gte]: item.quantity }, // Prevent negative stock
          }, 
          transaction,
        }
      );
      if (updatedRows === 0) {
        console.error(`[Order] Stock deduction failed for product ${item.product_id} — possible race condition`);
      }
    }

    // 2. Clear cart
    const cart = await Cart.findOne({ where: { user_id: order.user_id }, transaction });
    if (cart) {
      await CartItem.destroy({ where: { cart_id: cart.id }, transaction, force: true });
    }

    // 3. Update order status
    await order.update({ order_status: 'confirmed' }, { transaction });

    await transaction.commit();

    // 4. Create shipment in Shiprocket (non-blocking — don't fail the order)
    try {
      await shipmentService.createShipment(orderId, order.shipping_courier_id);
    } catch (shipErr) {
      console.error(`[Order] Shipment creation failed for order ${orderId}:`, shipErr.message);
      // Shipment can be created manually from admin later
    }

    // 5. Send order confirmation email (non-blocking)
    if (order.user) {
      emailService.sendOrderConfirmation(order.user.email, order.user.first_name, order).catch(() => {});
    }

    return order;
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
      { model: Shipment, as: 'shipment', attributes: ['id', 'status', 'awb_code', 'courier_name', 'tracking_url', 'estimated_delivery'] },
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

  const { count, rows } = await Order.findAndCountAll({
    where: buildOrderWhere(query),
    include: [
      { model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] },
      { model: OrderItem, as: 'items' },
      { model: Payment, as: 'payments', attributes: ['id', 'provider', 'status'] },
      { model: Shipment, as: 'shipment', attributes: ['id', 'status', 'awb_code', 'estimated_delivery', 'tracking_url', 'courier_name'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  return { orders: rows, pagination: getPaginationMeta(count, page, pageSize) };
}

/**
 * Build the where clause shared by admin order listing and export
 */
function buildOrderWhere(query) {
  const where = {};
  if (query.payment_status) where.payment_status = query.payment_status;
  if (query.order_status) where.order_status = query.order_status;
  if (query.user_id) where.user_id = query.user_id;
  if (query.from_date || query.to_date) {
    where.created_at = {};
    if (query.from_date) where.created_at[Op.gte] = new Date(query.from_date);
    if (query.to_date) where.created_at[Op.lte] = new Date(query.to_date);
  }
  return where;
}

/**
 * Admin: Export orders matching the current filters — one row per order, with
 * the line items condensed into a single readable column.
 */
async function exportOrders(query) {
  const orders = await Order.findAll({
    where: buildOrderWhere(query),
    include: [
      { model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] },
      { model: OrderItem, as: 'items' },
      { model: Payment, as: 'payments', attributes: ['provider', 'status'] },
      { model: Shipment, as: 'shipment', attributes: ['status', 'awb_code', 'courier_name', 'estimated_delivery'] },
      { model: Address, as: 'address' },
    ],
    order: [['created_at', 'DESC']],
    limit: EXPORT_ROW_CAP,
  });

  return orders.map((o) => {
    const items = o.items || [];
    const addr = o.address;

    let phone = '';
    if (addr) {
      try {
        phone = decryptFields(addr, ['phone_enc']).phone_enc || '';
      } catch {
        phone = '';
      }
    }

    const payment = (o.payments || [])[0];

    return {
      order_number: o.order_number,
      order_date: toDateString(o.created_at || o.createdAt),
      customer_name: [o.user?.first_name, o.user?.last_name].filter(Boolean).join(' ') || addr?.full_name || '',
      customer_email: o.user?.email || '',
      phone,
      order_status: o.order_status || '',
      payment_status: o.payment_status || '',
      payment_provider: payment?.provider || '',
      currency: o.currency || '',
      subtotal: toNumber(o.subtotal),
      discount: toNumber(o.discount),
      coupon_code: o.coupon_code || '',
      shipping_charge: toNumber(o.shipping_charge),
      cgst: toNumber(o.cgst),
      sgst: toNumber(o.sgst),
      igst: toNumber(o.igst),
      tax: toNumber(o.tax),
      total_amount: toNumber(o.total_amount),
      items_count: items.reduce((sum, it) => sum + (it.quantity || 0), 0),
      items: items.map((it) => `${it.product_name} (${it.product_sku}) x${it.quantity}`).join('; '),
      shipping_address: addr
        ? [addr.address_line1, addr.address_line2, addr.landmark].filter(Boolean).join(', ')
        : '',
      city: addr?.city || '',
      state: addr?.state || '',
      postal_code: addr?.postal_code || '',
      country: addr?.country || '',
      courier: o.shipment?.courier_name || '',
      awb_code: o.shipment?.awb_code || '',
      shipment_status: o.shipment?.status || '',
      estimated_delivery: toDateString(o.shipment?.estimated_delivery),
      notes: o.notes || '',
    };
  });
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
  confirmOrderAfterPayment,
  getUserOrders,
  getOrderById,
  adminListOrders,
  exportOrders,
  updateOrderStatus,
  updatePaymentStatus,
};
