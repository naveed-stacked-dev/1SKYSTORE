const router = require('express').Router();
const blogController = require('../controllers/blog.controller');
const { authenticateAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const blogValidation = require('../validations/blog.validation');

const { uploadImageMemory } = require('../middlewares/upload');

router.use(authenticateAdmin);

router.get('/', blogController.adminListBlogs);
router.get('/:id', blogController.adminGetBlog);
router.post('/', uploadImageMemory, validate(blogValidation.createBlog), blogController.createBlog);
router.put('/:id', uploadImageMemory, validate(blogValidation.updateBlog), blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

module.exports = router;
