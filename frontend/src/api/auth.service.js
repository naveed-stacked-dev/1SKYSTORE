import API from './axios';

const authService = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  googleLogin: (idToken) => API.post('/auth/google', { idToken }),
  refreshToken: (refreshToken) => API.post('/auth/refresh', { refreshToken }),
  verifyEmail: (token) => API.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (data) => API.post('/auth/reset-password', data),
  changePassword: (data) => API.post('/auth/change-password', data),

  // Profile
  getProfile: () => API.get('/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),

  // Admin auth
  adminLogin: (data) => API.post('/admin/auth/login', data),
  adminRegister: (data) => API.post('/admin/auth/register', data),
};

export default authService;
