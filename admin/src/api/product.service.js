import API from './axios';

const productService = {
  getAll: (params) => API.get('/admin/products', { params }),
  getById: (id) => API.get(`/admin/products/${id}`),
  create: (data) => API.post('/admin/products', data),
  update: (id, data) => API.put(`/admin/products/${id}`, data),
  delete: (id) => API.delete(`/admin/products/${id}`),
  toggleStatus: (id) => API.patch(`/admin/products/${id}/toggle`),
  bulkImport: (formData) =>
    API.post('/admin/products/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getCategories: () => API.get('/products/categories'),
  getBrands: () => API.get('/products/brands'),
};

export default productService;
