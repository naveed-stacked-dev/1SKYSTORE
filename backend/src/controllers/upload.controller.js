const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { s3Client, bucket } = require('../config/s3');

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

exports.getGallery = catchAsync(async (req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
    });
    
    const s3Response = await s3Client.send(command);
    
    // AWS S3 standard public URL construction
    const region = process.env.AWS_REGION || 'ap-south-1';
    
    // Format: https://{bucket}.s3.{region}.amazonaws.com/{key}
    const buildS3Url = (key) => `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    const filesList = (s3Response.Contents || [])
      .filter((item) => {
        // filter out 'folders' or empty objects if needed
        return item.Size > 0 && item.Key.match(/\.(jpeg|jpg|png|webp|gif|svg)$/i);
      })
      .map((item) => ({
        url: buildS3Url(item.Key),
        name: item.Key.split('/').pop(),
        folder: item.Key.includes('/') ? item.Key.split('/')[0] : 'root',
        lastModified: item.LastModified,
      }));

    // Sort by LastModified descending
    filesList.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    ApiResponse.success(res, 'Gallery fetched', { images: filesList });
  } catch (error) {
    console.error('S3 Gallery Fetch Error:', error);
    ApiResponse.error(res, 500, 'Failed to fetch gallery from S3: ' + error.message);
  }
});
