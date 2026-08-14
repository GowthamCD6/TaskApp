const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads/avatars directory exists
const uploadDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration for Avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

// File Filter (Images Only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed!'), false);
  }
};

const uploadAvatar = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

module.exports = {
  uploadAvatar,
  uploadDir,
};
