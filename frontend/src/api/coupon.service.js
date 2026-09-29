import API from './axios';

const couponService = {
  applyCoupon: (code) => API.post('/coupons/apply', { code }),
  getActiveCoupons: () => API.get('/coupons/active'),

  // Admin
  adminGetCoupons: (params = {}) => API.get('/admin/coupons', { params }),
  adminCreateCoupon: (data) => API.post('/admin/coupons', data),
  adminUpdateCoupon: (id, data) => API.put(`/admin/coupons/${id}`, data),
  adminDeleteCoupon: (id) => API.delete(`/admin/coupons/${id}`),
};

export default couponService;
