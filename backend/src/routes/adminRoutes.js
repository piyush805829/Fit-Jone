const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
const { adminLimiter } = require('../middleware/rateLimiter');

// Apply auth and rate limiting to ALL admin routes
router.use(adminAuth);
router.use(adminLimiter);

// Validation rules for creating a new version
const createVersionValidation = [
  body('versionName').notEmpty().withMessage('versionName is required').isString().withMessage('versionName must be a string'),
  body('versionCode').isInt().withMessage('versionCode must be an integer'),
  body('apkUrl').isURL().withMessage('apkUrl must be a valid URL'),
  body('backupApkUrl').optional({ checkFalsy: true }).isURL().withMessage('backupApkUrl must be a valid URL'),
  body('fileSize').notEmpty().withMessage('fileSize is required'),
];

// POST /version — Create a new APK version
router.post('/version', createVersionValidation, adminController.createVersion);

// GET /versions — Get all APK versions
router.get('/versions', adminController.getAllVersions);

// PUT /version/:id — Update an APK version
router.put('/version/:id', adminController.updateVersion);

// DELETE /version/:id — Delete an APK version
router.delete('/version/:id', adminController.deleteVersion);

// GET /analytics — Get download analytics
router.get('/analytics', adminController.getAnalytics);

// POST /verify-url — Verify URL status
router.post('/verify-url', adminController.verifyUrl);

module.exports = router;
