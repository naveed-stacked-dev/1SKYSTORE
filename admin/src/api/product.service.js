import API from './axios';

const productService = {
  getAll: (params) => API.get('/admin/products', { params }),
  getById: (id) => API.get(`/admin/products/${id}`),
  create: (data) => API.post('/admin/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => API.put(`/admin/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => API.delete(`/admin/products/${id}`),
  toggleStatus: (id) => API.patch(`/admin/products/${id}/toggle`),
  toggleFeatured: (id) => API.patch(`/admin/products/${id}/toggle-featured`),
  bulkImport: (formData) =>
    API.post('/admin/products/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0, // disable timeout for long-running bulk imports
    }),
  exportAll: (params) =>
    API.get('/admin/products/export', {
      params,
      responseType: 'blob',
      timeout: 0, // large catalogues can take a while to build
    }),
  bulkStatus: (data) => API.post('/admin/products/bulk-status', data),
  bulkDelete: (data) => API.post('/admin/products/bulk-delete', data),
  bulkStock: (data) => API.post('/admin/products/bulk-stock', data),
  bulkBestseller: (data) => API.post('/admin/products/bulk-bestseller', data),
  getCategories: () => API.get('/products/categories'),
  getBrands: () => API.get('/products/brands'),
  getSymptoms: () => API.get('/products/symptoms'),
};

export default productService;
