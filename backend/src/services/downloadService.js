const ApkVersion = require('../models/ApkVersion');
const DownloadStat = require('../models/DownloadStat');
const DownloadEvent = require('../models/DownloadEvent');
const { parseUserAgent, getCountryFromIP, getClientIP } = require('../utils/uaParser');

const downloadService = {
  /**
   * Get the latest APK version.
   * Falls back to the most recently created version if none is marked as latest.
   * @returns {Promise<Object|null>} The version document or null.
   */
  async getLatestVersion() {
    let version = await ApkVersion.findOne({ isLatest: true });

    if (!version) {
      version = await ApkVersion.findOne().sort({ createdAt: -1 });
    }

    return version || null;
  },

  /**
   * Track a download event (fire-and-forget).
   * Parses client info and creates a DownloadEvent + increments the global counter.
   * @param {Object} req - Express request object.
   * @param {Object} apkVersion - The APK version document being downloaded.
   */
  trackDownload(req, apkVersion) {
    const clientIp = getClientIP(req);
    const { browser, os, deviceType } = parseUserAgent(req.headers['user-agent']);
    const country = getCountryFromIP(clientIp);

    Promise.all([
      DownloadEvent.create({
        apkVersion: apkVersion._id,
        versionName: apkVersion.versionName,
        ipAddress: clientIp,
        country,
        deviceType,
        browser,
        os,
        userAgent: req.headers['user-agent'],
      }),
      DownloadStat.increment(),
    ]).catch((err) => {
      console.error('Error tracking download:', err);
    });
  },

  /**
   * Get formatted info about the latest version.
   * @returns {Promise<Object|null>} Version info or null.
   */
  async getVersionInfo() {
    const version = await this.getLatestVersion();

    if (!version) {
      return null;
    }

    return {
      version: version.versionName,
      versionCode: version.versionCode,
      fileSize: version.fileSize,
      releaseDate: version.createdAt.toISOString(),
      releaseNotes: version.releaseNotes,
      downloadUrl: '/api/download',
    };
  },

  /**
   * Get the total download count.
   * @returns {Promise<Object>} Object with totalDownloads.
   */
  async getDownloadCount() {
    const stats = await DownloadStat.getStats();
    return { totalDownloads: stats.totalDownloads };
  },
};

module.exports = downloadService;
