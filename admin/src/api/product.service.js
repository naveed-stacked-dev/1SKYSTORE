import API from './axios';

const productService = {
  getAll: (params) => API.get('/admin/products', { params }),
  getById: (id) => API.get(`/admin/products/${id}`),
  create: (data) => API.post('/admin/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => API.put(`/admin/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => API.delete(`/admin/products/${id}`),
  toggleStatus: (id) => API.patch(`/admin/products/${id}/toggle`),
  bulkImport: (formData) =>
    API.post('/admin/products/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0, // disable timeout for long-running bulk imports
    }),
  getCategories: () => API.get('/products/categories'),
  getBrands: () => API.get('/products/brands'),
};

export default productService;
