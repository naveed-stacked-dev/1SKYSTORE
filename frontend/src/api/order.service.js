import API from './axios';

const orderService = {
  placeOrder: (data) => API.post('/orders', data),
  getOrders: (params = {}) => API.get('/orders', { params }),
  getOrderDetail: (id) => API.get(`/orders/${id}`),

  // Admin
  adminGetOrders: (params = {}) => API.get('/admin/orders', { params }),
  adminGetOrder: (id) => API.get(`/admin/orders/${id}`),
  adminUpdateStatus: (id, status) => API.patch(`/admin/orders/${id}/status`, { status }),
};

export default orderService;
