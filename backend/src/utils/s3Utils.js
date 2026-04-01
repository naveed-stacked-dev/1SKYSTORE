const { DeleteObjectsCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
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

module.exports = { deleteFromS3 };
