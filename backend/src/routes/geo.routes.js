const router = require('express').Router();
const geoController = require('../controllers/geo.controller');

router.get('/detect', geoController.detectGeo);

module.exports = router;
