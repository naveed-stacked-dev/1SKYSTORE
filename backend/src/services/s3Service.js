const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, bucket } = require('../config/s3');

/**
 * Extracts the S3 object key from a full S3 URL.
 * e.g. https://my-bucket.s3.ap-south-1.amazonaws.com/banners/hero/uuid.jpg
 *   → banners/hero/uuid.jpg
 */
const extractS3Key = (imageUrl) => {
  try {
    const url = new URL(imageUrl);
    // pathname starts with '/', strip it
    return decodeURIComponent(url.pathname.slice(1));
  } catch {
    // If not a valid URL, treat as a raw key
    return imageUrl;
  }
};

/**
 * Deletes a single object from S3 by its public URL.
 * @param {string} imageUrl - Full S3 object URL
 */
const deleteFromS3 = async (imageUrl) => {
  const key = extractS3Key(imageUrl);
  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
  await s3Client.send(command);
};

/**
 * Deletes multiple objects from S3 by their URLs in parallel.
 * @param {string[]} imageUrls
 */
const deleteMultipleFromS3 = async (imageUrls = []) => {
  await Promise.allSettled(imageUrls.map((url) => deleteFromS3(url)));
};

module.exports = { deleteFromS3, deleteMultipleFromS3, extractS3Key };
