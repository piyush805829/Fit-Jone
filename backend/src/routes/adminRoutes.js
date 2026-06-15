const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
const { adminLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/multer');

// Apply auth and rate limiting to ALL admin routes
router.use(adminAuth);
router.use(adminLimiter);

// Validation rules for upload
const uploadValidation = [
  body('versionName')
    .notEmpty()
    .withMessage('versionName is required')
    .isString()
    .withMessage('versionName must be a string'),
  body('versionCode')
    .isInt({ min: 1 })
    .withMessage('versionCode must be a positive integer'),
  body('releaseNotes')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('releaseNotes must be a string'),
];

// POST /upload — Upload a new APK version and metadata
router.post('/upload', upload.single('apkFile'), uploadValidation, adminController.uploadVersion);

// GET /versions — Get all APK versions
router.get('/versions', adminController.getAllVersions);

// DELETE /version/:id — Delete an APK version
router.delete('/version/:id', adminController.deleteVersion);

// GET /analytics — Get download analytics
router.get('/analytics', adminController.getAnalytics);

// POST /verify-url — Verify URL status
router.post('/verify-url', adminController.verifyUrl);

module.exports = router;
