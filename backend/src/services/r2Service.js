const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const env = require('../config/env');

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.r2AccessKeyId,
    secretAccessKey: env.r2SecretAccessKey,
  },
});

/**
 * Upload an APK file buffer to Cloudflare R2
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} objectKey - Unique object name
 * @returns {Promise<string>} The public URL of the uploaded APK
 */
const uploadAPK = async (fileBuffer, objectKey) => {
  const command = new PutObjectCommand({
    Bucket: env.r2BucketName,
    Key: objectKey,
    Body: fileBuffer,
    ContentType: 'application/vnd.android.package-archive',
  });
  await s3.send(command);
  return getPublicURL(objectKey);
};

/**
 * Delete an APK file from Cloudflare R2
 * @param {string} objectKey - The object key of the APK to delete
 * @returns {Promise<void>}
 */
const deleteAPK = async (objectKey) => {
  const command = new DeleteObjectCommand({
    Bucket: env.r2BucketName,
    Key: objectKey,
  });
  await s3.send(command);
};

/**
 * Get the public URL for an object key
 * @param {string} objectKey - Unique object name
 * @returns {string} The full public URL
 */
const getPublicURL = (objectKey) => {
  const baseUrl = env.r2PublicUrl.replace(/\/$/, '');
  return `${baseUrl}/${objectKey}`;
};

/**
 * Helper to convert file size in bytes to a human-readable MB string
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted size (e.g. "107 MB")
 */
const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return '0 MB';
  const megabytes = bytes / (1024 * 1024);
  return `${Math.round(megabytes)} MB`;
};

module.exports = {
  uploadAPK,
  deleteAPK,
  getPublicURL,
  formatFileSize,
};
