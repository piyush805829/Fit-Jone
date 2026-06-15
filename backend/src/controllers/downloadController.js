const mongoose = require('mongoose');
const downloadService = require('../services/downloadService');

/**
 * Download the latest APK.
 * Redirects immediately to the R2 URL while logging analytics in the background.
 */
const download = async (req, res, next) => {
  try {
    const latestVersion = await downloadService.getLatestVersion();

    if (!latestVersion) {
      return res.status(404).json({
        error: 'No APK available',
        message: 'No APK version has been uploaded yet.',
      });
    }

    // Fire-and-forget analytics logging - never delay the download redirect
    downloadService.trackDownload(req, latestVersion);

    // 302 redirect immediately to the R2 APK URL
    return res.redirect(latestVersion.apkUrl);
  } catch (error) {
    next(error);
  }
};

/**
 * Get the latest version info.
 */
const getVersion = async (req, res, next) => {
  try {
    const versionInfo = await downloadService.getVersionInfo();

    if (!versionInfo) {
      return res.status(404).json({ error: 'No version found' });
    }

    return res.status(200).json(versionInfo);
  } catch (error) {
    next(error);
  }
};

/**
 * Get the total download count.
 */
const getDownloadCount = async (req, res, next) => {
  try {
    const count = await downloadService.getDownloadCount();
    return res.status(200).json(count);
  } catch (error) {
    next(error);
  }
};

/**
 * Health check endpoint.
 */
const healthCheck = async (req, res) => {
  try {
    const versionInfo = await downloadService.getVersionInfo();
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: versionInfo ? versionInfo.version : 'none',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  download,
  getVersion,
  getDownloadCount,
  healthCheck,
};
