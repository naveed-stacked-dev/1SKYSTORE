import API from './axios';

const authService = {
  login: (credentials) => API.post('/admin/auth/login', credentials),
  register: (data) => API.post('/admin/auth/register', data),
};

export default authService;
