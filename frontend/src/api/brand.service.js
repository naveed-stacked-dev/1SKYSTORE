import API from './axios';

const brandService = {
  getBrands: (config = {}) => API.get('/brands', config),
};

export default brandService;
