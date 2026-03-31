const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.uploadSingle = catchAsync(async (req, res) => {
  if (!req.file) {
    return ApiResponse.error(res, 400, 'No file uploaded');
  }
  ApiResponse.success(res, 'Image uploaded', { url: req.file.location });
});

exports.uploadMultiple = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return ApiResponse.error(res, 400, 'No files uploaded');
  }
  const urls = req.files.map((file) => file.location);
  ApiResponse.success(res, 'Images uploaded', { urls });
});
