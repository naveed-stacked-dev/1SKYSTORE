import api from './axios';

class BannerService {
  /**
   * Fetch banners, optionally filtered by type.
   * @param {'hero'|'info'|undefined} type
   */
  getBanners(type, device_type) {
    const params = {};
    if (type) params.type = type;
    if (device_type) params.device_type = device_type;
    return api.get('/admin/banners', { params });
  }

  /**
   * Upload images to S3 and persist in DB.
   * @param {File[]} files  - Array of File objects
   * @param {'hero'|'info'} type
   */
  uploadBanners(files, type, device_type = 'desktop') {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return api.post(`/admin/banners/upload?type=${type}&device_type=${device_type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /**
   * Delete a banner (removes from S3 + DB).
   * @param {number} id
   */
  deleteBanner(id) {
    return api.delete(`/admin/banners/${id}`);
  }

  /** Legacy: create banner via raw URL */
  createBanner(data) {
    return api.post('/admin/banners', data);
  }

  /** Legacy: update banner metadata */
  updateBanner(id, data) {
    return api.put(`/admin/banners/${id}`, data);
  }
}

export default new BannerService();
