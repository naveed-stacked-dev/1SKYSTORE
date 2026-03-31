const { detectCountry } = require('./src/utils/geoip');
console.log(detectCountry('::1'));
