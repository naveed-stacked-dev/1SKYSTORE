const { Op } = require('sequelize');
const { safeShiprocketRequest } = require('../config/shiprocket');
const { Shipment, Order, Address, OrderItem, User, Cart, CartItem, Product } = require('../models');
const ApiError = require('../utils/ApiError');
const { decrypt } = require('../utils/encryption');
const emailService = require('./email.service');

const PICKUP_POSTCODE = process.env.SHIPROCKET_PICKUP_POSTCODE || '500036';

function normalizeEstimatedDelivery(value) {
  if (!value) return null;

  const parsedDate = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}



/**
 * Calculate shipping rates via Shiprocket for checkout
 * Uses pickup postcode from env, delivery postcode from user address
 * Always prepaid (no COD)
 */
async function calculateShipping({ delivery_postcode, weight }) {
  if (!delivery_postcode) {
    throw ApiError.badRequest('Delivery postcode is required');
  }

  try {
    const response = await safeShiprocketRequest(async (api) => {
      return await api.get('/courier/serviceability', {
        params: {
          pickup_postcode: PICKUP_POSTCODE,
          delivery_postcode,
          weight: weight || 0.5,
          cod: 0, // Always prepaid, no COD
        },
      });
    });

    const couriers = response.data?.data?.available_courier_companies || [];
    
    if (couriers.length === 0) {
      return [];
    }

    return couriers.map((c) => ({
      courier_name: c.courier_name,
      courier_id: c.courier_company_id,
      rate: parseFloat(c.rate),
      estimated_delivery_days: c.estimated_delivery_days,
      etd: c.etd,
    }));
  } catch (error) {
    console.error('[Shiprocket] Shipping calculation error:', error.response?.data || error.message);
    throw ApiError.internal('Unable to calculate shipping cost');
  }
}

/**
 * Calculate shipping for checkout flow
 * Takes address_id, fetches postal code, computes weight from cart
 */
async function calculateShippingForCheckout(userId, addressId) {
  // console.log('Calculating shipping for user:', userId, 'address:', addressId);
  // 1. Get the address
  const address = await Address.findOne({
    where: { id: addressId, user_id: userId },
  });
  if (!address) throw ApiError.notFound('Address not found');

  // 2. Get cart items to compute weight
  const cart = await Cart.findOne({
    where: { user_id: userId },
    include: [{
      model: CartItem,
      as: 'items',
      include: [{ model: Product, as: 'product', attributes: ['id', 'weight'] }],
    }],
  });

  let totalWeight = 0;
  if (cart?.items) {
    for (const item of cart.items) {
      const productWeight = parseFloat(item.product?.weight || 500); // default 500g
      totalWeight += (productWeight / 1000) * item.quantity; // Convert grams to kg
    }
  }
  totalWeight = Math.max(totalWeight, 0.5); // Min 0.5 kg

  // 3. Fetch rates
  return calculateShipping({
    delivery_postcode: address.postal_code,
    weight: totalWeight,
  });
}

/**
 * Create a shipment in Shiprocket
 * ONLY call this after payment is confirmed
 */
async function createShipment(orderId, courierId = null) {
  const order = await Order.findByPk(orderId, {
    include: [
      { model: Address, as: 'address' },
      { model: OrderItem, as: 'items' },
      { model: User, as: 'user', attributes: ['email', 'first_name', 'phone_enc'] },
    ],
  });

  if (!order) throw ApiError.notFound('Order not found');
  if (order.payment_status !== 'paid') {
    throw ApiError.badRequest('Cannot create shipment for unpaid orders');
  }

  // Check if shipment already exists for this order
  const existingShipment = await Shipment.findOne({ where: { order_id: orderId } });
  if (existingShipment) {
    // console.log(`[Shiprocket] Shipment already exists for order ${orderId}, skipping creation`);
    return existingShipment;
  }

  const address = order.address;
  const phone = decrypt(address.phone_enc) || decrypt(order.user?.phone_enc);
  const initialEstimatedDelivery = normalizeEstimatedDelivery(
    order.estimated_delivery || order.etd || order.shipping_etd || null
  );

  // Build Shiprocket order payload
  const orderPayload = {
    order_id: order.order_number,
    order_date: new Date(order.createdAt || order.created_at || new Date()).toISOString().split('T')[0],
    pickup_location: 'Primary',
    billing_customer_name: address.full_name.split(' ')[0],
    billing_last_name: address.full_name.split(' ').slice(1).join(' ') || '',
    billing_address: address.address_line1,
    billing_address_2: [address.address_line2, address.landmark].filter(Boolean).join(', ') || '',
    billing_city: address.city,
    billing_pincode: address.postal_code,
    billing_state: address.state,
    billing_country: address.country,
    billing_email: order.user?.email || '',
    billing_phone: phone,
    shipping_is_billing: true,
    order_items: order.items.map((item) => ({
      name: item.product_name,
      sku: item.product_sku,
      units: item.quantity,
      selling_price: parseFloat(item.unit_price),
    })),
    payment_method: 'Prepaid',
    sub_total: parseFloat(order.total_amount),
    length: 10,
    breadth: 10,
    height: 10,
    weight: 0.5,
  };

  try {
    const response = await safeShiprocketRequest((api) => api.post('/orders/create/adhoc', orderPayload));
    const shipmentData = response.data;

    if (!shipmentData || shipmentData.status === false || !shipmentData.shipment_id) {
      console.error("❌ Shiprocket Error:", JSON.stringify(shipmentData, null, 2));
      throw new Error(shipmentData.message || "Shipment creation failed");
    }

    const shipment = await Shipment.create({
      order_id: orderId,
      shiprocket_order_id: shipmentData.order_id?.toString(),
      shiprocket_shipment_id: shipmentData.shipment_id?.toString(),
      status: 'pending',
      shipping_charge: parseFloat(order.shipping_charge) || 0,
      courier_id: courierId?.toString() || null,
      estimated_delivery: initialEstimatedDelivery,
    });

    // Update order status
    await order.update({ order_status: 'processing' });

    console.log(`[Shiprocket] Shipment created for order ${order.order_number}: shipment_id=${shipmentData.shipment_id}`);

    // Auto-generate AWB if courier_id is provided
    if (courierId && shipmentData.shipment_id) {
      try {
        await generateAwb(shipment.id, courierId);
      } catch (awbErr) {
        // Non-critical — AWB can be assigned later from admin
        console.error(`[Shiprocket] Auto AWB generation failed for shipment ${shipment.id}:`, awbErr.message);
      }
    }

    return shipment.reload();
  } catch (error) {
    console.error('[Shiprocket] Create shipment error:', error.response?.data || error.message);
    throw ApiError.internal('Unable to create shipment');
  }
}

// Shiprocket statuses after which tracking no longer changes
const TERMINAL_SHIPMENT_STATUSES = ['DELIVERED', 'CANCELED', 'CANCELLED', 'RTO DELIVERED', 'LOST', 'DESTROYED', 'DISPOSED OFF'];

// Our own order_status values (anything else is raw Shiprocket text from older syncs)
const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

// Keeps a hung Shiprocket request from blocking a sync (and the background job) forever
const TRACKING_TIMEOUT_MS = 10000;

function isTerminalShipmentStatus(status) {
  return TERMINAL_SHIPMENT_STATUSES.includes(String(status || '').trim().toUpperCase());
}

/**
 * Map a raw Shiprocket status (e.g. "OUT FOR PICKUP", "IN TRANSIT") onto our
 * order_status values (processing / shipped / delivered / cancelled).
 */
function mapShipmentToOrderStatus(shipmentStatus) {
  const s = String(shipmentStatus || '').trim().toUpperCase();
  if (!s) return null;
  if (s === 'DELIVERED') return 'delivered';
  if (s === 'CANCELED' || s === 'CANCELLED') return 'cancelled';
  if (/PICKUP|AWB|MANIFEST|NEW|PENDING|PROCESSING|READY TO SHIP/.test(s)) return 'processing';
  return 'shipped'; // picked up, in transit, out for delivery, RTO, etc.
}

/**
 * Pull live tracking from Shiprocket for a shipment (loaded with order.user)
 * and persist status / ETA / tracking URL on both shipment and order.
 * Throws on Shiprocket errors.
 */
async function syncShipmentStatus(shipment) {
  if (!shipment.awb_code) return null;

  const response = await safeShiprocketRequest((api) => api.get(`/courier/track/awb/${shipment.awb_code}`, { timeout: TRACKING_TIMEOUT_MS }));
  const trackingData = response.data?.tracking_data;
  if (!trackingData) return null;

  const currentTrack = trackingData.shipment_track && trackingData.shipment_track[0];
  const newStatus = currentTrack?.current_status || shipment.status || 'processing';
  const oldStatus = shipment.status;
  const shipmentUpdate = {
    status: newStatus,
    tracking_url: trackingData.track_url || shipment.tracking_url,
  };
  const liveEstimatedDelivery = normalizeEstimatedDelivery(trackingData.etd);

  if (liveEstimatedDelivery) {
    shipmentUpdate.estimated_delivery = liveEstimatedDelivery;
  }

  // Always save so updated_at records the last check (used to throttle syncs)
  shipment.set(shipmentUpdate);
  shipment.changed('status', true);
  await shipment.save();

  // Only move the order when the courier status actually changed, so a manual
  // admin status change isn't undone by the next sync. Raw Shiprocket text left
  // in order_status by older syncs is always converted.
  const order = shipment.order;
  const orderStatus = mapShipmentToOrderStatus(newStatus);
  if (order && orderStatus && orderStatus !== order.order_status
    && (newStatus !== oldStatus || !ORDER_STATUSES.includes(order.order_status))) {
    await order.update({ order_status: orderStatus });
  }

  if (newStatus !== oldStatus && order && order.user) {
    emailService.sendShipmentUpdate(order.user.email, order.user.first_name, shipment).catch(() => {});
  }

  return trackingData;
}

const SHIPMENT_ORDER_INCLUDE = {
  model: Order, as: 'order', attributes: ['id', 'order_number', 'order_status', 'user_id'],
  include: [{ model: User, as: 'user', attributes: ['email', 'first_name'] }],
};

/**
 * Track shipment by shipment ID (user must own the order when userId is given)
 */
async function trackShipment(shipmentId, userId = null) {
  const shipment = await Shipment.findByPk(shipmentId, { include: [SHIPMENT_ORDER_INCLUDE] });
  if (!shipment || (userId && shipment.order?.user_id !== userId)) {
    throw ApiError.notFound('Shipment not found');
  }

  if (shipment.awb_code) {
    try {
      const trackingData = await syncShipmentStatus(shipment);
      if (trackingData) return { shipment, tracking: trackingData };
    } catch (error) {
      console.error('[Shiprocket] Tracking fetch error:', error.message);
    }
  }

  return { shipment, tracking: null };
}

/**
 * Refresh an order's shipment from Shiprocket if it is still in transit.
 * Never throws — a Shiprocket outage must not break the caller.
 */
async function syncOrderShipment(orderId) {
  try {
    const shipment = await Shipment.findOne({ where: { order_id: orderId }, include: [SHIPMENT_ORDER_INCLUDE] });
    if (!shipment || !shipment.awb_code || isTerminalShipmentStatus(shipment.status)) return;
    await syncShipmentStatus(shipment);
  } catch (error) {
    console.error(`[Shiprocket] Sync failed for order ${orderId}:`, error.message);
  }
}

/**
 * Refresh in-transit shipments for a set of orders (e.g. the admin list page).
 * Skips shipments checked in the last few minutes and gives up waiting after
 * a few seconds so the list never hangs on Shiprocket. Never throws.
 * Returns true if any shipment was refreshed.
 */
async function syncOrderShipments(orderIds, { freshMinutes = 10, timeoutMs = 8000 } = {}) {
  try {
    if (!orderIds || !orderIds.length) return false;

    const shipments = await Shipment.findAll({
      where: {
        order_id: { [Op.in]: orderIds },
        awb_code: { [Op.ne]: null },
        status: { [Op.notIn]: TERMINAL_SHIPMENT_STATUSES },
        updated_at: { [Op.lt]: new Date(Date.now() - freshMinutes * 60 * 1000) },
      },
      include: [SHIPMENT_ORDER_INCLUDE],
    });
    if (!shipments.length) return false;

    const syncAll = Promise.all(shipments.map((shipment) =>
      syncShipmentStatus(shipment).catch((error) => {
        console.error(`[Shiprocket] Sync failed for shipment ${shipment.id}:`, error.message);
      })
    ));
    let timer;
    const timeout = new Promise((resolve) => { timer = setTimeout(resolve, timeoutMs); });
    await Promise.race([syncAll, timeout]);
    clearTimeout(timer);
    return true;
  } catch (error) {
    console.error('[Shiprocket] Bulk sync failed:', error.message);
    return false;
  }
}

/**
 * Background job: refresh every in-transit shipment created in the last 60 days,
 * one at a time.
 */
async function syncActiveShipments() {
  const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const shipments = await Shipment.findAll({
    where: {
      awb_code: { [Op.ne]: null },
      status: { [Op.notIn]: TERMINAL_SHIPMENT_STATUSES },
      created_at: { [Op.gte]: since },
    },
    include: [SHIPMENT_ORDER_INCLUDE],
  });

  let updated = 0;
  for (const shipment of shipments) {
    const before = shipment.status;
    try {
      await syncShipmentStatus(shipment);
      if (shipment.status !== before) updated++;
    } catch (error) {
      console.error(`[Shiprocket] Sync failed for shipment ${shipment.id}:`, error.message);
    }
  }

  console.log(`[Shiprocket] Status sync: checked ${shipments.length}, updated ${updated}`);
}

/**
 * Generate AWB (assign courier to shipment)
 * 
 * FLOW: Payment Success → Create Shipment → Generate AWB
 * 
 * Validations:
 * - Shipment must exist
 * - shiprocket_shipment_id must be present
 * - AWB must not already be assigned (idempotent — returns existing if present)
 */
async function generateAwb(shipmentId, courierId) {
  if (!courierId) {
    throw ApiError.badRequest('courier_id is required for AWB generation');
  }

  const shipment = await Shipment.findByPk(shipmentId, {
    include: [{ 
      model: Order, as: 'order', attributes: ['id', 'order_number', 'payment_status'],
      include: [{ model: User, as: 'user', attributes: ['email', 'first_name'] }]
    }],
  });

  // Validation 1: Shipment exists
  if (!shipment) {
    throw ApiError.notFound('Shipment not found');
  }

  // Validation 2: Shiprocket shipment must be created first
  if (!shipment.shiprocket_shipment_id) {
    throw ApiError.badRequest('Shiprocket shipment not created yet. Create shipment first.');
  }

  // Validation 3: Payment must be successful
  if (shipment.order && shipment.order.payment_status !== 'paid') {
    throw ApiError.badRequest('Cannot generate AWB for unpaid orders');
  }

  // Idempotency: If AWB already exists, return existing shipment
  if (shipment.awb_code) {
    console.log(`[Shiprocket] AWB already assigned for shipment ${shipmentId}: ${shipment.awb_code}`);
    return shipment;
  }

  try {
    const response = await safeShiprocketRequest((api) => api.post('/courier/assign/awb', {
      shipment_id: shipment.shiprocket_shipment_id,
      courier_id: courierId,
    }));

    const awbData = response.data?.response?.data;
    
    if (!awbData || !awbData.awb_code) {
      console.error('[Shiprocket] AWB response missing awb_code:', JSON.stringify(response.data));
      throw ApiError.internal('Shiprocket returned no AWB code');
    }

    // Update shipment with AWB details
    await shipment.update({
      awb_code: awbData.awb_code,
      courier_name: awbData.courier_name || null,
      courier_id: courierId.toString(),
      status: 'pickup_scheduled',
    });

    // console.log(`[Shiprocket] AWB generated for shipment ${shipmentId}: AWB=${awbData.awb_code}, Courier=${awbData.courier_name}`);

    // Send notification email (non-blocking)
    if (shipment.order && shipment.order.user) {
      emailService.sendShipmentUpdate(
        shipment.order.user.email,
        shipment.order.user.first_name,
        shipment
      ).catch((emailErr) => {
        console.error(`[Email] Failed to send shipment update for shipment ${shipmentId}:`, emailErr.message);
      });
    }

    return shipment.reload();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('[Shiprocket] AWB generation error:', error.response?.data || error.message);
    throw ApiError.internal('Unable to generate AWB. Please try again or assign courier manually.');
  }
}

module.exports = {
  calculateShipping, calculateShippingForCheckout, createShipment, trackShipment, generateAwb,
  syncOrderShipment, syncOrderShipments, syncActiveShipments,
};
