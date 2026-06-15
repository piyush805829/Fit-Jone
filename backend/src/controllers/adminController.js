const { validationResult } = require('express-validator');
const ApkVersion = require('../models/ApkVersion');
const analyticsService = require('../services/analyticsService');
const githubReleaseService = require('../services/githubReleaseService');

/**
 * Upload a new APK and automatically manage GitHub Release integration.
 * Zero-downtime flow: old assets are only cleaned up after new version is fully live.
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

    // Auto-detect and format size
    const fileSizeStr = githubReleaseService.formatFileSize(req.file.size);

    // Step 1: Find existing version document
    const oldVersion = await ApkVersion.findOne({});

    // Step 2: Create new GitHub Release
    let releaseData;
    try {
      releaseData = await githubReleaseService.createRelease(versionName, releaseNotes);
    } catch (err) {
      console.error('GitHub Release Creation Error:', err);
      return res.status(500).json({ error: 'Failed to create GitHub release', details: err.message });
    }

    const releaseId = releaseData.id.toString();

    // Step 3: Upload the APK asset to the new release
    let assetData;
    const fileName = `FitJone-v${versionName}.apk`;
    try {
      assetData = await githubReleaseService.uploadReleaseAsset(releaseId, req.file.buffer, fileName);
    } catch (err) {
      console.error('GitHub Asset Upload Error:', err);
      // Clean up the created release if upload fails to avoid orphan releases
      try {
        await githubReleaseService.deleteRelease(releaseId);
      } catch (cleanupErr) {
        console.error('Failed to clean up release after asset upload failure:', cleanupErr);
      }
      return res.status(500).json({ error: 'Failed to upload APK asset to GitHub', details: err.message });
    }

    const assetId = assetData.id.toString();

    // Step 4: Get download URL
    let apkUrl;
    try {
      apkUrl = await githubReleaseService.getDownloadURL(releaseId, assetId);
    } catch (err) {
      // Fallback to the browser_download_url returned during asset upload if GET fails
      apkUrl = assetData.browser_download_url;
    }

    // Step 5: Create the new MongoDB version document
    let newVersion;
    try {
      newVersion = await ApkVersion.create({
        versionName,
        versionCode: parseInt(versionCode, 10),
        apkUrl,
        releaseId,
        assetId,
        fileSize: fileSizeStr,
        releaseNotes: releaseNotes || '',
      });
    } catch (err) {
      console.error('DB Document Creation Error:', err);
      // Clean up GitHub assets/releases to prevent orphan files on DB failure
      try {
        await githubReleaseService.deleteAsset(assetId);
        await githubReleaseService.deleteRelease(releaseId);
      } catch (cleanupErr) {
        console.error('Failed to clean up GitHub objects after DB failure:', cleanupErr);
      }
      return res.status(500).json({ error: 'Failed to save version metadata to database', details: err.message });
    }

    // Step 6: ONLY AFTER SUCCESS, delete the old release, asset, and DB document
    if (oldVersion) {
      // Delete old asset from GitHub
      if (oldVersion.assetId) {
        try {
          await githubReleaseService.deleteAsset(oldVersion.assetId);
        } catch (err) {
          console.error(`Failed to delete old asset (${oldVersion.assetId}) from GitHub:`, err);
        }
      }

      // Delete old release from GitHub
      if (oldVersion.releaseId) {
        try {
          await githubReleaseService.deleteRelease(oldVersion.releaseId);
        } catch (err) {
          console.error(`Failed to delete old release (${oldVersion.releaseId}) from GitHub:`, err);
        }
      }

      // Delete old document from MongoDB
      try {
        await ApkVersion.deleteOne({ _id: oldVersion._id });
      } catch (err) {
        console.error('Failed to delete old version document from MongoDB:', err);
      }
    }

    return res.status(201).json({
      message: 'Version uploaded and release created successfully',
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
 * Flow:
 * 1. Find version document.
 * 2. Read releaseId & assetId.
 * 3. Delete APK asset from GitHub.
 * 4. Delete GitHub Release.
 * 5. Delete MongoDB document.
 */
const deleteVersion = async (req, res, next) => {
  try {
    const version = await ApkVersion.findById(req.params.id);

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Delete asset from GitHub
    if (version.assetId) {
      try {
        await githubReleaseService.deleteAsset(version.assetId);
      } catch (err) {
        console.error(`Failed to delete GitHub asset (${version.assetId}):`, err);
        return res.status(500).json({ error: 'Failed to delete APK asset from GitHub', details: err.message });
      }
    }

    // Delete release from GitHub
    if (version.releaseId) {
      try {
        await githubReleaseService.deleteRelease(version.releaseId);
      } catch (err) {
        console.error(`Failed to delete GitHub release (${version.releaseId}):`, err);
        return res.status(500).json({ error: 'Failed to delete GitHub release', details: err.message });
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
