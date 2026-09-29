const router = require('express').Router();
const shippingController = require('../controllers/shipping.controller');
const { authenticateUser } = require('../middlewares/auth');

router.use(authenticateUser);

router.post('/calculate', shippingController.calculateShipping);
router.post('/create', shippingController.createShipment);
router.get('/track/:shipmentId', shippingController.trackShipment);
router.post('/generate-awb', shippingController.generateAwb);

module.exports = router;
