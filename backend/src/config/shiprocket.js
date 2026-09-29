const axios = require('axios');

const SHIPROCKET_BASE_URL = process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external';

let cachedToken = null;
let tokenExpiry = null;

async function generateToken() {
  // console.log('[Shiprocket] Generating new auth token...');
  try {
    const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });
    cachedToken = response.data.token;
    tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
    // console.log('[Shiprocket] Auth token generated successfully.');
    return cachedToken;
  } catch (error) {
    console.error('[Shiprocket] Failed to generate token:', error.response?.data || error.message);
    throw new Error('Shiprocket authentication failed');
  }
}

async function getShiprocketToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  return await generateToken();
}

/**
 * Safe wrapper for Shiprocket API requests.
 * Handles token injection, error logging, and auto-retry on 401/403.
 * 
 * @param {Function} apiCallFn - Async function taking an authenticated Axios instance
 */
async function safeShiprocketRequest(apiCallFn) {
  let token = await getShiprocketToken();
  let api = axios.create({
    baseURL: SHIPROCKET_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  try {
    return await apiCallFn(api);
  } catch (error) {
    const status = error.response?.status;
    
    // Auth error (token expired or invalid)
    if (status === 401 || status === 403) {
      console.log(`[Shiprocket] Request failed with ${status}. Refreshing token and retrying...`);
      
      // Clear cache and regenerate token
      cachedToken = null;
      tokenExpiry = null;
      token = await generateToken();
      
      // Re-create api client with new token
      api = axios.create({
        baseURL: SHIPROCKET_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      try {
        console.log('[Shiprocket] Retrying request with new token...');
        return await apiCallFn(api);
      } catch (retryError) {
        console.error('[Shiprocket] Retry failed:', retryError.response?.data || retryError.message);
        throw retryError;
      }
    }
    
    // Non-auth error
    console.error('[Shiprocket] API Error:', error.response?.data || error.message);
    throw error;
  }
}

// Deprecated, keep for backwards compatibility if needed, but safeShiprocketRequest should be used
async function shiprocketApi() {
  const token = await getShiprocketToken();
  return axios.create({
    baseURL: SHIPROCKET_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}

module.exports = { shiprocketApi, getShiprocketToken, safeShiprocketRequest };
