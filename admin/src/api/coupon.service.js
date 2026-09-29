import API from './axios';

const couponService = {
  getAll: (params) => API.get('/admin/coupons', { params }),
  create: (data) => API.post('/admin/coupons', data),
  update: (id, data) => API.put(`/admin/coupons/${id}`, data),
  delete: (id) => API.delete(`/admin/coupons/${id}`),
};

export default couponService;
