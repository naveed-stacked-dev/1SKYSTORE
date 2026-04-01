import axios from 'axios';
import { getStorage, setStorage, removeStorage } from '@/utils/storage';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach admin auth token
API.interceptors.request.use(
  (config) => {
    const token = getStorage('adminAccessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh + global errors
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getStorage('adminRefreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        removeStorage('adminAccessToken');
        removeStorage('adminRefreshToken');
        removeStorage('admin_user');
        window.dispatchEvent(new CustomEvent('admin:logout'));
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'}/auth/refresh`,
          { refreshToken }
        );

        const newToken = data.accessToken || data.data?.accessToken;
        if (newToken) {
          setStorage('adminAccessToken', newToken);
          if (data.refreshToken || data.data?.refreshToken) {
            setStorage('adminRefreshToken', data.refreshToken || data.data?.refreshToken);
          }
          API.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        removeStorage('adminAccessToken');
        removeStorage('adminRefreshToken');
        removeStorage('admin_user');
        window.dispatchEvent(new CustomEvent('admin:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default API;
