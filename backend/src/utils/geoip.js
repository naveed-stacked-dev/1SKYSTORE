const geoip = require('geoip-lite');

/**
 * Detect country from request IP address
 * Returns { country, isIndia, currency }
 */
function detectCountry(ip) {
  // Handle localhost / development
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
    return { country: 'IN', isIndia: true, currency: 'INR' };
  }

  const geo = geoip.lookup(ip);
  if (!geo) {
    // Default to USD for unknown IPs
    return { country: 'US', isIndia: false, currency: 'USD' };
  }

  const isIndia = geo.country === 'IN';
  return {
    country: geo.country,
    isIndia,
    currency: isIndia ? 'INR' : 'USD',
  };
}

/**
 * Extract client IP from request (handles proxies)
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.connection?.remoteAddress ||
         req.ip;
}

module.exports = { detectCountry, getClientIp };
