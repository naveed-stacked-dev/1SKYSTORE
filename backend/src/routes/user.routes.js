const router = require('express').Router();
const userController = require('../controllers/user.controller');
const { authenticateUser } = require('../middlewares/auth');

router.get('/profile', authenticateUser, userController.getProfile);
router.put('/profile', authenticateUser, userController.updateProfile);

module.exports = router;
