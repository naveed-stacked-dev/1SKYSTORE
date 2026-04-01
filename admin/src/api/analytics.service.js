import API from './axios';

const analyticsService = {
  getDashboard: () => API.get('/admin/analytics/dashboard'),
  getSales: (params) => API.get('/admin/analytics/sales', { params }),
  getRevenue: (params) => API.get('/admin/analytics/revenue', { params }),
  getTopProducts: () => API.get('/admin/analytics/top-products'),
  getTopBrands: () => API.get('/admin/analytics/top-brands'),
  getUserGrowth: () => API.get('/admin/analytics/users'),
  getOrdersSummary: () => API.get('/admin/analytics/orders'),
};

export default analyticsService;
