const router = require('express').Router();
const adminUserController = require('../controllers/adminUser.controller');
const { authenticateAdmin } = require('../middlewares/auth');

router.use(authenticateAdmin);

router.get('/', adminUserController.listUsers);
router.get('/:id', adminUserController.getUserById);
router.get('/:id/orders', adminUserController.getUserOrders);

module.exports = router;
