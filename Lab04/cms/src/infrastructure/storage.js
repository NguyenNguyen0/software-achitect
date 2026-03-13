const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../../config/default');

const uploadDir = path.resolve(config.upload.dir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  config.upload.allowedTypes.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error(`File type "${file.mimetype}" not allowed`), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxSize },
});

module.exports = { upload, uploadDir };
