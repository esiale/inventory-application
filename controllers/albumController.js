const Album = require('../models/album');
const Artist = require('../models/artist');
const Genre = require('../models/genre');
const Product = require('../models/product');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const {
  uploadImage,
  processImage,
  validateFile,
} = require('../utils/handleImage');
const { body, validationResult } = require('express-validator');

exports.album_list = (req, res, next) => {
  Album.find()
    .sort({ name: 1 })
    .populate('artist')
    .exec((err, album_list) => {
      if (err) return next(err);
      res.render('album_list', {
        title: 'InventoryApp - albums',
        album_list: album_list,
      });
    });
};

exports.album_detail = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const fetch_album = Album.findById(id)
    .sort({ name: 1 })
    .populate('artist')
    .populate('genre')
    .exec();
  const fetch_products = Product.find({ album: id })
    .sort({ format: 1 })
    .populate({
      path: 'format',
      populate: 'name',
    })
    .exec();
  Promise.all([fetch_album, fetch_products])
    .then((results) => {
      if (results[0] == null) {
        const err = new Error('Album not found');
        err.status = 404;
        return next(err);
      }
      res.render('album_detail', {
        title: `InventoryApp - ${results[0].name}`,
        album_detail: results[0],
        products: results[1],
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.album_create_get = (req, res, next) => {
  const fetch_artists = Artist.find().exec();
  const fetch_genres = Genre.find().exec();
  Promise.all([fetch_artists, fetch_genres])
    .then((results) => {
      res.render('album_form', {
        title: 'InventoryApp - add album',
        artists: results[0],
        genres: results[1],
      });
    })
    .catch((error) => next(error));
};

exports.album_create_post = [
  uploadImage.single('image'),
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }
    next();
  },
  body('name')
    .trim()
    .notEmpty()
    .withMessage('* Album name is required')
    .isLength({ max: 50 })
    .withMessage('* Album name must be 50 characters or less')
    .escape(),
  body('artist').trim().notEmpty().withMessage('* Artist is required').escape(),
  body('released')
    .trim()
    .notEmpty()
    .withMessage('* Released year is required')
    .isLength({ min: 4, max: 4 })
    .withMessage('* Released year must contain 4 digits, i.e. 1992')
    .isInt()
    .withMessage('* Released year must be a number')
    .escape(),
  body('label').trim().notEmpty().withMessage('* Label is required').escape(),
  validateFile,
  (req, res, next) => {
    const errors = validationResult(req);
    const album = new Album({
      name: req.body.name,
      artist: req.body.artist,
      released: req.body.released,
      label: req.body.label,
      genre: req.body.genre,
    });
    if (!errors.isEmpty()) {
      const fetch_artists = Artist.find().exec();
      const fetch_genres = Genre.find().exec();
      Promise.all([fetch_artists, fetch_genres])
        .then((results) => {
          for (let i = 0; i < results[1].length; i++) {
            if (album.genre.indexOf(results[1][i]._id) > -1) {
              results[1][i].checked = 'true';
            }
          }
          res.render('album_form', {
            title: 'InventoryApp - add album',
            artists: results[0],
            genres: results[1],
            album: album,
            errors: errors.array({ onlyFirstError: true }),
          });
        })
        .catch((error) => next(error));
    } else {
      Album.findOne({ name: req.body.name }).exec(async (err, found_album) => {
        if (err) return next(err);
        if (found_album) {
          res.redirect(found_album.url);
        } else {
          if (!req.file) {
            album.picture_url = '/images/no_image.svg';
          } else {
            const picture_id = `img-${uuidv4()}`;
            await processImage(req, next, picture_id);
            album.picture_url = `/images/${picture_id}`;
          }
          album.save((err) => {
            if (err) return next(err);
            res.redirect(album.url);
          });
        }
      });
    }
  },
];

exports.album_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.album_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.album_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.album_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED');
};
