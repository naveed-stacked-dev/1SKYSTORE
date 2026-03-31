const axios = require('axios');

const SHIPROCKET_BASE_URL = process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external';

let cachedToken = null;
let tokenExpiry = null;

/**
 * Get Shiprocket auth token (cached until expiry)
 */
async function getShiprocketToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD,
  });

  cachedToken = response.data.token;
  // Token valid for ~10 days, refresh after 9 days
  tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
  return cachedToken;
}

/**
 * Create an authenticated Axios instance for Shiprocket API
 */
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

module.exports = { shiprocketApi, getShiprocketToken };
