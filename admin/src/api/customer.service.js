import API from './axios';

const customerService = {
  getAll: (params) => API.get('/admin/users', { params }),
  getById: (id) => API.get(`/admin/users/${id}`),
  getOrderHistory: (id) => API.get(`/admin/users/${id}/orders`),
};

export default customerService;
