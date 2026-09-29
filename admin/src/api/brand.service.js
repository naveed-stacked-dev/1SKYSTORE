import api from './axios';

class BrandService {
  /** List all brands (admin) */
  getBrands(params = {}) {
    return api.get('/admin/brands', { params });
  }

  /** Get single brand */
  getBrand(id) {
    return api.get(`/admin/brands/${id}`);
  }

  /** Create brand with optional image */
  createBrand(name, imageFile, extraData = {}) {
    const formData = new FormData();
    formData.append('name', name);
    if (imageFile) formData.append('image', imageFile);
    Object.entries(extraData).forEach(([k, v]) => formData.append(k, v));
    return api.post('/admin/brands', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /** Update brand */
  updateBrand(id, data, imageFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, v));
    if (imageFile) formData.append('image', imageFile);
    return api.put(`/admin/brands/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /** Delete brand */
  deleteBrand(id) {
    return api.delete(`/admin/brands/${id}`);
  }

  /** Toggle active status */
  toggleBrand(id) {
    return api.patch(`/admin/brands/${id}/toggle`);
  }
}

export default new BrandService();
