import api from './axios';

class BannerService {
  getBanners() {
    return api.get('/banners');
  }
}

export default new BannerService();
