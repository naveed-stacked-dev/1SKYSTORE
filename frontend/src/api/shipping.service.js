import API from './axios';

const shippingService = {
  calculateShipping: (data) => API.post('/shipping/calculate', data),
  createShipment: (orderId, courierId) => API.post('/shipping/create', { order_id: orderId, courier_id: courierId }),
  trackShipment: (shipmentId) => API.get(`/shipping/track/${shipmentId}`),
  generateAWB: (data) => API.post('/shipping/generate-awb', data),
};

export default shippingService;
