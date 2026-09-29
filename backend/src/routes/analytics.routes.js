const router = require('express').Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateAdmin } = require('../middlewares/auth');

router.use(authenticateAdmin);

router.get('/dashboard', analyticsController.getDashboard);
router.get('/sales', analyticsController.getSales);
router.get('/revenue', analyticsController.getRevenue);
router.get('/top-products', analyticsController.getTopProducts);
router.get('/top-brands', analyticsController.getTopBrands);
router.get('/users', analyticsController.getUserGrowth);
router.get('/orders', analyticsController.getOrdersSummary);

module.exports = router;
