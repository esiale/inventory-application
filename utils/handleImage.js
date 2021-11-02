const sharp = require('sharp');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

const storage = multer.memoryStorage();
const uploadImage = multer({ storage });

const processImage = async (req, next, id) => {
  try {
    sharp(req.file.buffer)
      .resize(300)
      .jpeg()
      .toFile('./public/images/' + id + '.jpeg');
  } catch (err) {
    next(err);
  }
};

const validateFile = (req, res, next) => {
  const allowedExtensions = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
  ];
  console.log(req);
  if (!req.file) {
    return next();
  }
  if (!allowedExtensions.includes(req.file.mimetype)) {
    const err = new Error('File type not allowed');
    err.statusCode = 500;
    return next(err);
  }
  if (req.file.size >= 5242880) {
    const err = new Error('File is too large');
    err.statusCode = 500;
    return next(err);
  }
  next();
};

const deleteImage = (item) => {
  if (item.picture_url !== '/images/no_image.svg') {
    return fs.unlink(path.join('public/' + item.picture_url));
  }
};

module.exports = { uploadImage, processImage, validateFile, deleteImage };
