const { validationResult } = require('express-validator');
const ApkVersion = require('../models/ApkVersion');
const analyticsService = require('../services/analyticsService');
const r2Service = require('../services/r2Service');

/**
 * Upload a new APK version and clean up the old one upon success.
 */
const uploadVersion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'APK file is required' });
    }

    const { versionName, versionCode, releaseNotes } = req.body;

    // Detect file size and format it
    const fileSizeStr = r2Service.formatFileSize(req.file.size);

    // Step 1: Find existing version document
    const oldVersion = await ApkVersion.findOne({});

    // Step 2: Generate unique object name
    const timestamp = Math.floor(Date.now() / 1000);
    const objectKey = `FitJone-v${versionName}-${timestamp}.apk`;

    // Step 3: Upload the new APK to Cloudflare R2
    let apkUrl;
    try {
      apkUrl = await r2Service.uploadAPK(req.file.buffer, objectKey);
    } catch (err) {
      console.error('Cloudflare R2 Upload Error:', err);
      return res.status(500).json({ error: 'Failed to upload APK to Cloudflare R2', details: err.message });
    }

    // Step 4 & 6: Create the new version document in MongoDB
    let newVersion;
    try {
      newVersion = await ApkVersion.create({
        versionName,
        versionCode: parseInt(versionCode, 10),
        apkUrl,
        objectKey,
        fileSize: fileSizeStr,
        releaseNotes: releaseNotes || '',
      });
    } catch (err) {
      // If DB creation fails, try to delete the newly uploaded APK to avoid orphan files in R2
      try {
        await r2Service.deleteAPK(objectKey);
      } catch (delErr) {
        console.error('Failed to clean up uploaded APK after DB error:', delErr);
      }
      return res.status(500).json({ error: 'Failed to save version metadata to database', details: err.message });
    }

    // Step 5: Delete old version ONLY after new version successfully created
    if (oldVersion) {
      if (oldVersion.objectKey) {
        try {
          await r2Service.deleteAPK(oldVersion.objectKey);
        } catch (err) {
          console.error(`Failed to delete old APK (${oldVersion.objectKey}) from R2:`, err);
          // Do not fail the request if R2 delete fails, to keep DB synced
        }
      }
      try {
        await ApkVersion.deleteOne({ _id: oldVersion._id });
      } catch (err) {
        console.error('Failed to delete old version metadata from DB:', err);
      }
    }

    return res.status(201).json({
      message: 'Version uploaded successfully',
      version: newVersion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all APK versions sorted by creation date (newest first).
 */
const getAllVersions = async (req, res, next) => {
  try {
    const versions = await ApkVersion.find().sort({ createdAt: -1 });
    return res.status(200).json({ versions });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an APK version by ID.
 */
const deleteVersion = async (req, res, next) => {
  try {
    const version = await ApkVersion.findById(req.params.id);

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Read objectKey and delete APK from R2
    if (version.objectKey) {
      try {
        await r2Service.deleteAPK(version.objectKey);
      } catch (err) {
        console.error(`Failed to delete APK file (${version.objectKey}) from R2:`, err);
        return res.status(500).json({ error: 'Failed to delete APK from storage', details: err.message });
      }
    }

    // Delete MongoDB document
    await version.deleteOne();

    return res.status(200).json({ message: 'Version deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get full analytics data.
 */
const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getFullAnalytics();
    return res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
};

/**
 * Verify URL status (Online/Offline) with timeout and response time
 */
const verifyUrl = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const start = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
      const headRes = await fetch(url, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeoutId);
      
      const responseTime = Date.now() - start;
      if (headRes.ok || headRes.status === 301 || headRes.status === 302 || headRes.status === 403 || headRes.status === 405) {
        return res.status(200).json({ online: true, responseTime });
      } else {
        return res.status(200).json({ online: false, responseTime, reason: `HTTP ${headRes.status}` });
      }
    } catch (e) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        return res.status(200).json({ online: false, reason: 'timeout' });
      }
      return res.status(200).json({ online: false, reason: e.message });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadVersion,
  getAllVersions,
  deleteVersion,
  getAnalytics,
  verifyUrl,
};
