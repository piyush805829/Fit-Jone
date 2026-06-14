const mongoose = require('mongoose');

const downloadStatSchema = new mongoose.Schema({
  totalDownloads: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Atomically increment the total download count by 1.
 * Uses upsert to create the singleton document if it doesn't exist.
 * @returns {Promise<Document>} The updated stats document
 */
downloadStatSchema.statics.increment = async function () {
  const stats = await this.findOneAndUpdate(
    {},
    {
      $inc: { totalDownloads: 1 },
      $set: { lastUpdated: new Date() },
    },
    { upsert: true, new: true }
  );
  return stats;
};

/**
 * Retrieve the singleton stats document, or create one if none exists.
 * @returns {Promise<Document>} The stats document
 */
downloadStatSchema.statics.getStats = async function () {
  let stats = await this.findOne({});
  if (!stats) {
    stats = await this.create({ totalDownloads: 0 });
  }
  return stats;
};

module.exports = mongoose.model('DownloadStat', downloadStatSchema);
