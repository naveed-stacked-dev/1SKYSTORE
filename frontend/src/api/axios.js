import axios from 'axios';
import { getStorage, setStorage, removeStorage } from '@/utils/storage';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  // timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token
API.interceptors.request.use(
  (config) => {
    const token = getStorage('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Endpoints where a 401 means "those credentials are wrong", not "your session
// expired" — these must never trigger the refresh/logout flow, and their error
// message has to reach the caller intact.
const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/google',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
];

const isAuthRequest = (config) =>
  AUTH_ENDPOINTS.some((path) => (config?.url || '').includes(path));

/**
 * Reduce an axios error to the API's human-readable message.
 * Every rejection below goes through this so callers can show `err.message`.
 */
const formatError = (error, fallback) => {
  const data = error?.response?.data;
  // The API nests field-level problems at error.errors — surface the first one,
  // since "Validation failed" alone doesn't tell the user what to change.
  const fieldErrors = data?.error?.errors;
  const firstField = Array.isArray(fieldErrors) ? fieldErrors[0]?.message : null;

  let message = data?.message;
  if (message && firstField && /^validation (failed|error)$/i.test(message)) {
    message = firstField;
  }
  if (!message) message = firstField;
  // `data.error` is an object on this API — only usable if a string sneaks through
  if (!message && typeof data?.error === 'string') message = data.error;
  if (!message) message = fallback;
  // Axios' own messages ("Request failed with status code 401") are not for users
  if (!message && !error?.response) {
    message = 'Cannot reach the server. Please check your connection and try again.';
  }
  if (!message) message = 'Something went wrong. Please try again.';

  return { message, status: error?.response?.status, data };
};

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

    // If 401 on a protected call and not already retrying. Sign-in/sign-up
    // failures fall straight through to the formatter below.
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest(originalRequest)) {
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

      const refreshToken = getStorage('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        removeStorage('accessToken');
        removeStorage('refreshToken');
        removeStorage('user');
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(formatError(error, 'Please sign in to continue.'));
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'}/auth/refresh`,
          { refreshToken }
        );

        const newToken = data.accessToken || data.data?.accessToken;
        if (newToken) {
          setStorage('accessToken', newToken);
          if (data.refreshToken || data.data?.refreshToken) {
            setStorage('refreshToken', data.refreshToken || data.data?.refreshToken);
          }
          API.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        removeStorage('accessToken');
        removeStorage('refreshToken');
        removeStorage('user');
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(
          formatError(refreshError, 'Your session has expired. Please sign in again.')
        );
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(formatError(error));
  }
);

export default API;
