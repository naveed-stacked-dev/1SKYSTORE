const router = require('express').Router();
const orderController = require('../controllers/order.controller');
const { authenticateUser } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const orderValidation = require('../validations/order.validation');

router.use(authenticateUser);

router.post('/', validate(orderValidation.createOrder), orderController.createOrder);
router.get('/', validate(orderValidation.listOrders), orderController.getUserOrders);
router.get('/:id', orderController.getOrder);

module.exports = router;
