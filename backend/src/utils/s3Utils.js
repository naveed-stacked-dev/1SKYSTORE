const { PutObjectCommand, DeleteObjectsCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, bucket } = require('../config/s3');

/**
 * Helper to delete objects from S3 given their URLs
 * @param {string[]} urls - Array of S3 URLs
 */
async function deleteFromS3(urls) {
  if (!urls || urls.length === 0) return;
  
  const keys = urls.map(url => {
    try {
      if (!url.includes('.amazonaws.com/')) return null;
      const key = url.split('.amazonaws.com/')[1];
      return { Key: key };
    } catch (err) {
      return null;
    }
  }).filter(Boolean);

  if (keys.length === 0) return;

  try {
    const command = new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: keys,
        Quiet: true,
      },
    });
    await s3Client.send(command);
    console.log(`Deleted ${keys.length} objects from S3`);
  } catch (error) {
    console.error('Error deleting objects from S3:', error);
  }
}

/**
 * Helper to upload a buffer to S3
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - File mime type
 * @param {string} key - S3 object key
 * @returns {Promise<string>} Uploaded file URL
 */
async function uploadBufferToS3(buffer, mimetype, key) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  });
  await s3Client.send(command);
  
  const region = process.env.AWS_REGION || 'ap-south-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

module.exports = { deleteFromS3, uploadBufferToS3 };
