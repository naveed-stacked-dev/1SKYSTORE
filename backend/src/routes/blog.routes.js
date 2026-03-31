const router = require('express').Router();
const blogController = require('../controllers/blog.controller');

// Public blog endpoints
router.get('/', blogController.listBlogs);
router.get('/:slug', blogController.getBlogBySlug);

module.exports = router;
