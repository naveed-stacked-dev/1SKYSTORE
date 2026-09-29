import API from './axios';

const orderService = {
  getAll: (params) => API.get('/admin/orders', { params }),
  getById: (id) => API.get(`/admin/orders/${id}`),
  updateStatus: (id, status) => API.patch(`/admin/orders/${id}/status`, { status }),
  exportAll: (params) =>
    API.get('/admin/orders/export', {
      params,
      responseType: 'blob',
      timeout: 0,
    }),
};

export default orderService;
