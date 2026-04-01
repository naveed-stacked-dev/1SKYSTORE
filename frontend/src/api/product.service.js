import API from './axios';

const productService = {
  getProducts: (params = {}, config = {}) => API.get('/products', { params, ...config }),
  getBestProducts: (params = {}, config = {}) => API.get('/products/best', { params, ...config }),
  getProductsByBrand: (params = {}, config = {}) => API.get('/products/by-brand', { params, ...config }),
  getProductsByCategory: (params = {}, config = {}) => API.get('/products/by-category', { params, ...config }),
  getProductBySlug: (slug, config = {}) => API.get(`/products/${slug}`, config),
  getCategories: (config = {}) => API.get('/products/categories', config),
  getBrands: (config = {}) => API.get('/products/brands', config),

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
