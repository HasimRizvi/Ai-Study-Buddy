const path = require('path');
const fs = require('fs');
const multer = require('multer');
const ApiError = require('../utils/ApiError');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const MAX_SIZE = (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024;

const ALLOWED_EXT = ['.txt', '.md', '.text', '.csv', '.json'];
const ALLOWED_MIME = [
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
  'text/markdown; charset=utf-8',
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXT.includes(ext) || ALLOWED_MIME.includes(file.mimetype)) {
    return cb(null, true);
  }
  return cb(ApiError.badRequest('Only .txt, .md, .csv and .json study material files are supported'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

module.exports = { upload, UPLOAD_DIR, MAX_SIZE };
