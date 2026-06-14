const { validationResult } = require('express-validator');
const ApkVersion = require('../models/ApkVersion');
const analyticsService = require('../services/analyticsService');

/**
 * Create a new APK version and set it as the latest.
 */
const createVersion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { versionName, versionCode, apkUrl, backupApkUrl, fileSize, releaseNotes } = req.body;

    const newVersion = await ApkVersion.create({
      versionName,
      versionCode,
      apkUrl,
      backupApkUrl,
      fileSize,
      releaseNotes,
    });

    await ApkVersion.setLatest(newVersion._id);

    return res.status(201).json({
      message: 'Version created successfully',
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
 * Update an existing APK version by ID.
 * If isLatest is set to true, updates the latest flag accordingly.
 */
const updateVersion = async (req, res, next) => {
  try {
    const version = await ApkVersion.findById(req.params.id);

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Update only provided fields
    const allowedFields = ['versionName', 'versionCode', 'apkUrl', 'backupApkUrl', 'fileSize', 'releaseNotes'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        version[field] = req.body[field];
      }
    });

    if (req.body.isLatest === true) {
      await ApkVersion.setLatest(version._id);
    }

    await version.save();

    return res.status(200).json({
      message: 'Version updated',
      version,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an APK version by ID.
 * If it was the latest, promotes the next most recent version.
 */
const deleteVersion = async (req, res, next) => {
  try {
    const version = await ApkVersion.findById(req.params.id);

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // If deleting the latest version, promote the next most recent
    if (version.isLatest) {
      const nextVersion = await ApkVersion.findOne({ _id: { $ne: version._id } })
        .sort({ createdAt: -1 });

      if (nextVersion) {
        await ApkVersion.setLatest(nextVersion._id);
      }
    }

    await version.deleteOne();

    return res.status(200).json({ message: 'Version deleted' });
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
  createVersion,
  getAllVersions,
  updateVersion,
  deleteVersion,
  getAnalytics,
  verifyUrl,
};
