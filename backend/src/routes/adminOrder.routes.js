const router = require('express').Router();
const orderController = require('../controllers/order.controller');
const { authenticateAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const orderValidation = require('../validations/order.validation');

router.use(authenticateAdmin);

router.get('/', validate(orderValidation.listOrders), orderController.adminListOrders);
// Must stay above '/:id' so 'export' isn't swallowed as an id
router.get('/export', validate(orderValidation.listOrders), orderController.exportOrders);
router.get('/:id', orderController.adminGetOrder);
router.patch('/:id/status', validate(orderValidation.updateOrderStatus), orderController.updateOrderStatus);

module.exports = router;
