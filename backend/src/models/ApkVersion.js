const mongoose = require('mongoose');

const apkVersionSchema = new mongoose.Schema({
  versionName: {
    type: String,
    required: [true, 'Version name is required'],
    trim: true,
  },
  versionCode: {
    type: Number,
    required: [true, 'Version code is required'],
  },
  apkUrl: {
    type: String,
    required: [true, 'APK URL is required'],
  },
  backupApkUrl: {
    type: String,
    default: '',
  },
  fileSize: {
    type: String,
    required: [true, 'File size is required'],
  },
  releaseNotes: {
    type: String,
    default: '',
  },
  isLatest: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for fast latest-version queries
apkVersionSchema.index({ isLatest: 1 });

/**
 * Sets the specified version as the latest release.
 * Unsets isLatest on all other versions first.
 * @param {ObjectId} versionId - The ID of the version to mark as latest
 * @returns {Promise<Document>} The updated version document
 */
apkVersionSchema.statics.setLatest = async function (versionId) {
  // Unmark all versions
  await this.updateMany({}, { isLatest: false });

  // Mark the specified version as latest
  const updated = await this.findByIdAndUpdate(
    versionId,
    { isLatest: true },
    { new: true }
  );

  if (!updated) {
    throw new Error(`Version with ID ${versionId} not found`);
  }

  return updated;
};

module.exports = mongoose.model('ApkVersion', apkVersionSchema);
