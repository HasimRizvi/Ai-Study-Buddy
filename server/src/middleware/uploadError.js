const multer = require('multer');
const ApiError = require('../utils/ApiError');
const { MAX_SIZE } = require('./upload');

const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const mb = Math.round(MAX_SIZE / 1024 / 1024);
      return next(ApiError.badRequest(`File is too large. Maximum allowed size is ${mb} MB`));
    }
    return next(ApiError.badRequest(`Upload failed: ${err.message}`));
  }
  return next(err);
};

module.exports = handleUploadErrors;
