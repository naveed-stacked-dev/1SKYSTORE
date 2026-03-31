const router = require('express').Router();
const orderController = require('../controllers/order.controller');
const { authenticateAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const orderValidation = require('../validations/order.validation');

router.use(authenticateAdmin);

router.get('/', validate(orderValidation.listOrders), orderController.adminListOrders);
router.get('/:id', orderController.adminGetOrder);
router.patch('/:id/status', validate(orderValidation.updateOrderStatus), orderController.updateOrderStatus);

module.exports = router;
