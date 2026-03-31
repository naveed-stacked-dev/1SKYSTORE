const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const { detectCountry, getClientIp } = require('../utils/geoip');

exports.detectGeo = catchAsync(async (req, res) => {
  const ip = getClientIp(req);
  const geoData = detectCountry(ip);
  ApiResponse.success(res, 'GeoIP detected', { ip, ...geoData });
});
