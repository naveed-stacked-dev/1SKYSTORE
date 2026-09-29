const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const { authenticateAdmin } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');

router.use(authenticateAdmin);

router.post('/', requireRole('super_admin'), adminController.createAdmin);
router.get('/', requireRole('super_admin'), adminController.listAdmins);
router.put('/:id', requireRole('super_admin'), adminController.updateAdmin);

module.exports = router;
