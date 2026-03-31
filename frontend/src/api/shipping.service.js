import API from './axios';

const shippingService = {
  calculateShipping: (orderId) => API.post('/shipping/calculate', { order_id: orderId }),
  createShipment: (orderId) => API.post('/shipping/create', { order_id: orderId }),
  trackShipment: (shipmentId) => API.get(`/shipping/track/${shipmentId}`),
  generateAWB: (data) => API.post('/shipping/generate-awb', data),
};

export default shippingService;
