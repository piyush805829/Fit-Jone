const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Validate extension
  const ext = path.extname(file.originalname).toLowerCase();
  const isApkExt = ext === '.apk';

  // Validate mime type
  const isApkMime = file.mimetype === 'application/vnd.android.package-archive';

  if (isApkExt && isApkMime) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Android APK (.apk) files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 250 * 1024 * 1024, // 250MB limit
  },
  fileFilter,
});

module.exports = upload;
