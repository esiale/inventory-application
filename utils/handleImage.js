const sharp = require('sharp');
const multer = require('multer');

const storage = multer.memoryStorage();
const uploadImage = multer({ storage });

const processImage = async (req, next, id) => {
  try {
    sharp(req.file.buffer)
      .resize(300)
      .toFile('./public/images/' + id);
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

module.exports = { uploadImage, processImage, validateFile };
