const mongoose = require('mongoose');

const downloadEventSchema = new mongoose.Schema({
  apkVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApkVersion',
  },
  versionName: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  country: {
    type: String,
    default: 'Unknown',
  },
  deviceType: {
    type: String,
    default: 'Unknown',
  },
  browser: {
    type: String,
    default: 'Unknown',
  },
  os: {
    type: String,
    default: 'Unknown',
  },
  userAgent: {
    type: String,
  },
  downloadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for analytics queries
downloadEventSchema.index({ downloadedAt: -1 });
downloadEventSchema.index({ country: 1 });
downloadEventSchema.index({ versionName: 1 });

module.exports = mongoose.model('DownloadEvent', downloadEventSchema);
