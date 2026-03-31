const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { s3Client, bucket } = require('../config/s3');
const ApiError = require('../utils/ApiError');

// Allowed image MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Multer storage using S3
 */
const s3Storage = multerS3({
  s3: s3Client,
  bucket: bucket,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const folder = req.uploadFolder || 'uploads';
    const filename = `${folder}/${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

/**
 * File filter for images only
 */
const imageFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_TYPES.join(', ')}`), false);
  }
};

/**
 * Single image upload middleware
 */
const uploadSingle = multer({
  storage: s3Storage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('image');

/**
 * Multiple images upload middleware (max 10)
 */
const uploadMultiple = multer({
  storage: s3Storage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).array('images', 10);

/**
 * Excel file upload (to memory for processing)
 */
const uploadExcel = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only .xlsx and .xls files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single('file');

module.exports = { uploadSingle, uploadMultiple, uploadExcel };
