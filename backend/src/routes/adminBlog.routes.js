const router = require('express').Router();
const blogController = require('../controllers/blog.controller');
const { authenticateAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const blogValidation = require('../validations/blog.validation');

router.use(authenticateAdmin);

router.get('/', blogController.adminListBlogs);
router.get('/:id', blogController.adminGetBlog);
router.post('/', validate(blogValidation.createBlog), blogController.createBlog);
router.put('/:id', validate(blogValidation.updateBlog), blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

module.exports = router;
