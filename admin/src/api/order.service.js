import API from './axios';

const orderService = {
  getAll: (params) => API.get('/admin/orders', { params }),
  getById: (id) => API.get(`/admin/orders/${id}`),
  updateStatus: (id, status) => API.patch(`/admin/orders/${id}/status`, { status }),
};

export default orderService;
