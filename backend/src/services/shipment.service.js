const { shiprocketApi } = require('../config/shiprocket');
const { Shipment, Order, Address, OrderItem, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { decrypt } = require('../utils/encryption');
const emailService = require('./email.service');

/**
 * Calculate shipping cost via Shiprocket
 */
async function calculateShipping({ pickup_postcode, delivery_postcode, weight, cod = false }) {
  try {
    const api = await shiprocketApi();
    const response = await api.get('/courier/serviceability/', {
      params: {
        pickup_postcode,
        delivery_postcode,
        weight: weight || 0.5,
        cod: cod ? 1 : 0,
      },
    });

    const couriers = response.data?.data?.available_courier_companies || [];
    return couriers.map((c) => ({
      courier_name: c.courier_name,
      courier_id: c.courier_company_id,
      rate: c.rate,
      estimated_delivery_days: c.estimated_delivery_days,
      etd: c.etd,
    }));
  } catch (error) {
    console.error('Shiprocket shipping calculation error:', error.response?.data || error.message);
    throw ApiError.internal('Unable to calculate shipping cost');
  }
}

/**
 * Create a shipment in Shiprocket
 */
async function createShipment(orderId) {
  const order = await Order.findByPk(orderId, {
    include: [
      { model: Address, as: 'address' },
      { model: OrderItem, as: 'items' },
    ],
  });

  if (!order) throw ApiError.notFound('Order not found');
  if (order.payment_status !== 'paid') {
    throw ApiError.badRequest('Cannot create shipment for unpaid orders');
  }

  const address = order.address;
  const phone = decrypt(address.phone_enc) || '0000000000';

  // Build Shiprocket order payload
  const orderPayload = {
    order_id: order.order_number,
    order_date: new Date(order.created_at).toISOString().split('T')[0],
    pickup_location: 'Primary',
    billing_customer_name: address.full_name.split(' ')[0],
    billing_last_name: address.full_name.split(' ').slice(1).join(' ') || '',
    billing_address: address.address_line1,
    billing_address_2: address.address_line2 || '',
    billing_city: address.city,
    billing_pincode: address.postal_code,
    billing_state: address.state,
    billing_country: address.country,
    billing_email: '', // Will be filled from user
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
    const api = await shiprocketApi();
    const response = await api.post('/orders/create/adhoc', orderPayload);

    const shipmentData = response.data;

    const shipment = await Shipment.create({
      order_id: orderId,
      shiprocket_order_id: shipmentData.order_id?.toString(),
      shiprocket_shipment_id: shipmentData.shipment_id?.toString(),
      status: 'pending',
      shipping_charge: parseFloat(order.shipping_charge) || 0,
    });

    // Update order status
    await order.update({ order_status: 'processing' });

    return shipment;
  } catch (error) {
    console.error('Shiprocket create shipment error:', error.response?.data || error.message);
    throw ApiError.internal('Unable to create shipment');
  }
}

/**
 * Track shipment by order ID
 */
async function trackShipment(shipmentId) {
  const shipment = await Shipment.findByPk(shipmentId, {
    include: [{ 
      model: Order, as: 'order', attributes: ['id', 'order_number', 'order_status'],
      include: [{ model: User, as: 'user', attributes: ['email', 'first_name'] }]
    }],
  });
  if (!shipment) throw ApiError.notFound('Shipment not found');

  // If AWB code exists, fetch live tracking
  if (shipment.awb_code) {
    try {
      const api = await shiprocketApi();
      const response = await api.get(`/courier/track/awb/${shipment.awb_code}`);
      const trackingData = response.data?.tracking_data;

      if (trackingData) {
        // Update local status
        const statusMap = {
          '1': 'pickup_scheduled',
          '2': 'picked_up',
          '3': 'in_transit',
          '4': 'in_transit',
          '5': 'in_transit',
          '6': 'delivered',
          '7': 'returned',
          '8': 'cancelled',
        };

        const newStatus = statusMap[trackingData.shipment_status] || shipment.status;
        const oldStatus = shipment.status;
        
        await shipment.update({
          status: newStatus,
          tracking_url: trackingData.track_url || shipment.tracking_url,
        });

        if (newStatus !== oldStatus && shipment.order && shipment.order.user) {
          emailService.sendShipmentUpdate(shipment.order.user.email, shipment.order.user.first_name, shipment).catch(() => {});
        }

        return { shipment, tracking: trackingData };
      }
    } catch (error) {
      console.error('Tracking fetch error:', error.message);
    }
  }

  return { shipment, tracking: null };
}

/**
 * Generate AWB (assign courier)
 */
async function generateAwb(shipmentId, courierId) {
  const shipment = await Shipment.findByPk(shipmentId, {
    include: [{ 
      model: Order, as: 'order', attributes: ['id', 'order_number'],
      include: [{ model: User, as: 'user', attributes: ['email', 'first_name'] }]
    }],
  });
  if (!shipment) throw ApiError.notFound('Shipment not found');
  if (!shipment.shiprocket_shipment_id) {
    throw ApiError.badRequest('Shiprocket shipment not created yet');
  }

  try {
    const api = await shiprocketApi();
    const response = await api.post('/courier/assign/awb', {
      shipment_id: shipment.shiprocket_shipment_id,
      courier_id: courierId,
    });

    const awbData = response.data?.response?.data;
    if (awbData) {
      await shipment.update({
        awb_code: awbData.awb_code,
        courier_name: awbData.courier_name,
        courier_id: courierId?.toString(),
        status: 'pickup_scheduled',
      });
      
      if (shipment.order && shipment.order.user) {
        emailService.sendShipmentUpdate(shipment.order.user.email, shipment.order.user.first_name, shipment).catch(() => {});
      }
    }

    return shipment.reload();
  } catch (error) {
    console.error('AWB generation error:', error.response?.data || error.message);
    throw ApiError.internal('Unable to generate AWB');
  }
}

module.exports = { calculateShipping, createShipment, trackShipment, generateAwb };
