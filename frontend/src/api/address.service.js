import API from './axios';

const addressService = {
  getAddresses: () => API.get('/addresses'),
  getAddress: (id) => API.get(`/addresses/${id}`),
  createAddress: (data) => API.post('/addresses', data),
  updateAddress: (id, data) => API.put(`/addresses/${id}`, data),
  deleteAddress: (id) => API.delete(`/addresses/${id}`),
};

export default addressService;
