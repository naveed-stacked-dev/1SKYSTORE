import API from './axios';

const authService = {
  login: (credentials) => API.post('/admin/auth/login', credentials),
  register: (data) => API.post('/admin/auth/register', data),
  changePassword: (data) => API.post('/admin/auth/change-password', data),
};

export default authService;
