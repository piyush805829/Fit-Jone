const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const { downloadLimiter } = require('../middleware/rateLimiter');

// GET /download — Download the latest APK (rate-limited)
router.get('/download', downloadLimiter, downloadController.download);

// GET /version — Get latest version info
router.get('/version', downloadController.getVersion);

// GET /latest-version — Alias for version info
router.get('/latest-version', downloadController.getVersion);

// GET /download-count — Get total download count
router.get('/download-count', downloadController.getDownloadCount);

// GET /health — Health check
router.get('/health', downloadController.healthCheck);

module.exports = router;
