const router = require('express').Router();
const uploadController = require('../controllers/upload.controller');
const { authenticateAdmin } = require('../middlewares/auth');
const { uploadSingle, uploadMultiple } = require('../middlewares/upload');

router.use(authenticateAdmin);

router.get('/gallery', uploadController.getGallery);

router.post('/image', (req, res, next) => {
  req.uploadFolder = 'products';
  next();
}, uploadSingle, uploadController.uploadSingle);

router.post('/images', (req, res, next) => {
  req.uploadFolder = 'products';
  next();
}, uploadMultiple, uploadController.uploadMultiple);

router.post('/banner', (req, res, next) => {
  req.uploadFolder = 'banners';
  next();
}, uploadSingle, uploadController.uploadSingle);

router.delete('/image', uploadController.deleteImage);

module.exports = router;
