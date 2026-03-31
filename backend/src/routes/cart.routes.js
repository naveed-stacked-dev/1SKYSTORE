const router = require('express').Router();
const cartController = require('../controllers/cart.controller');
const { authenticateUser } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.delete('/item/:productId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

module.exports = router;
