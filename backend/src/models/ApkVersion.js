const mongoose = require('mongoose');

const apkVersionSchema = new mongoose.Schema(
  {
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
    objectKey: {
      type: String,
      required: [true, 'Object key is required'],
      trim: true,
    },
    fileSize: {
      type: String,
      required: [true, 'File size is required'],
    },
    releaseNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ApkVersion', apkVersionSchema);
