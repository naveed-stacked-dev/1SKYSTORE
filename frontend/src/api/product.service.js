import API from './axios';

const productService = {
  getProducts: (params = {}) => API.get('/products', { params }),
  getBestProducts: (params = {}) => API.get('/products/best', { params }),
  getProductsByBrand: (params = {}) => API.get('/products/by-brand', { params }),
  getProductsByCategory: (params = {}) => API.get('/products/by-category', { params }),
  getProductBySlug: (slug) => API.get(`/products/${slug}`),
  getCategories: () => API.get('/products/categories'),
  getBrands: () => API.get('/products/brands'),

  // Admin
  adminGetProducts: (params = {}) => API.get('/admin/products', { params }),
  adminGetProduct: (id) => API.get(`/admin/products/${id}`),
  adminCreateProduct: (data) => API.post('/admin/products', data),
  adminUpdateProduct: (id, data) => API.put(`/admin/products/${id}`, data),
  adminDeleteProduct: (id) => API.delete(`/admin/products/${id}`),
  adminToggleStatus: (id) => API.patch(`/admin/products/${id}/toggle`),
  adminBulkImport: (formData) =>
    API.post('/admin/products/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default productService;
