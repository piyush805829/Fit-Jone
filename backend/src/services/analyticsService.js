const DownloadStat = require('../models/DownloadStat');
const DownloadEvent = require('../models/DownloadEvent');

const analyticsService = {
  /**
   * Get comprehensive analytics data.
   * Runs all aggregations in parallel for performance.
   * @returns {Promise<Object>} Full analytics object.
   */
  async getFullAnalytics() {
    const now = new Date();

    const startOfToday = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    ));

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      stats,
      todayDownloads,
      weeklyDownloads,
      monthlyDownloads,
      topCountries,
      topBrowsers,
      topDevices,
      downloadsByVersion,
      recentDownloads,
    ] = await Promise.all([
      // Total downloads from the stats singleton
      DownloadStat.getStats(),

      // Today's downloads
      DownloadEvent.countDocuments({ downloadedAt: { $gte: startOfToday } }),

      // Weekly downloads
      DownloadEvent.countDocuments({ downloadedAt: { $gte: sevenDaysAgo } }),

      // Monthly downloads
      DownloadEvent.countDocuments({ downloadedAt: { $gte: thirtyDaysAgo } }),

      // Top 10 countries
      DownloadEvent.aggregate([
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, country: '$_id', count: 1 } },
      ]),

      // Top 10 browsers
      DownloadEvent.aggregate([
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, browser: '$_id', count: 1 } },
      ]),

      // Top 10 device types
      DownloadEvent.aggregate([
        { $group: { _id: '$deviceType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, device: '$_id', count: 1 } },
      ]),

      // Downloads by version
      DownloadEvent.aggregate([
        { $group: { _id: '$versionName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, version: '$_id', count: 1 } },
      ]),

      // Recent 20 downloads
      DownloadEvent.find()
        .sort({ downloadedAt: -1 })
        .limit(20)
        .select('versionName country browser deviceType downloadedAt'),
    ]);

    return {
      totalDownloads: stats.totalDownloads,
      todayDownloads,
      weeklyDownloads,
      monthlyDownloads,
      topCountries,
      topBrowsers,
      topDevices,
      downloadsByVersion,
      recentDownloads,
    };
  },
};

module.exports = analyticsService;
