import API from './axios';

const geoService = {
  detectGeo: () => API.get('/geo/detect'),
};

export default geoService;
