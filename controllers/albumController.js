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
    if (!Array.isArray(req.body.genre)) {
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
  body('genre.*').escape(),
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
      Album.findOne({ name: req.body.name, artist: req.body.artist }).exec(
        async (err, found_album) => {
          if (err) return next(err);
          if (found_album) {
            res.redirect(found_album.url);
          } else {
            if (!req.file) {
              album.picture_url = '/images/no_image.svg';
            } else {
              const picture_id = `img-${uuidv4()}`;
              await processImage(req, next, picture_id);
              album.picture_url = `/images/${picture_id}.jpeg`;
            }
            album.save((err) => {
              if (err) return next(err);
              res.redirect(album.url);
            });
          }
        }
      );
    }
  },
];

exports.album_delete_get = (req, res, next) => {
  const fetch_album = Album.findById(req.params.id).populate('artist').exec();
  const fetch_products = Product.find({ album: req.params.id })
    .populate('format')
    .exec();
  Promise.all([fetch_album, fetch_products])
    .then((results) => {
      if (results[0] === null) return res.redirect('/albums');
      res.render('album_delete', {
        title: 'InventoryApp - delete album',
        album: results[0],
        products: results[1],
      });
    })
    .catch((error) => next(error));
};

exports.album_delete_post = (req, res, next) => {
  const fetch_album = Album.findById(req.params.id).exec();
  const fetch_products = Product.find({ album: req.params.id }).exec();
  Promise.all([fetch_album, fetch_products])
    .then((results) => {
      if (results[1].length > 0) {
        return res.render('album_delete', {
          title: 'InventoryApp - delete product',
          album: results[0],
          products: results[1],
        });
      } else {
        Album.findByIdAndRemove(req.params.id, (error) => {
          if (error) return next(error);
          res.redirect('/albums');
        });
      }
    })
    .catch((error) => next(error));
};

exports.album_update_get = (req, res, next) => {
  const fetch_album = Album.findById(req.params.id).populate('genre').exec();
  const fetch_artists = Artist.find();
  const fetch_genres = Genre.find();
  Promise.all([fetch_album, fetch_artists, fetch_genres]).then((results) => {
    if (results[0] === null) {
      const error = new Error('Album not found');
      error.status = 404;
      return next(error);
    }
    for (let i = 0; i < results[2].length; i++) {
      for (let y = 0; y < results[0].genre.length; y++) {
        if (results[2][i]._id.toString() === results[0].genre[y]._id.toString())
          results[2][i].checked = 'true';
      }
    }
    res.render('album_form', {
      title: 'InventoryApp - update album',
      album: results[0],
      artists: results[1],
      genres: results[2],
    });
  });
};

exports.album_update_post = [
  uploadImage.single('image'),
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
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
  body('genre.*').escape(),
  validateFile,
  async (req, res, next) => {
    const errors = validationResult(req);
    const album = new Album({
      name: req.body.name,
      artist: req.body.artist,
      released: req.body.released,
      label: req.body.label,
      genre: typeof req.body.genre === 'undefined' ? [] : req.body.genre,
      _id: req.params.id,
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
            title: 'InventoryApp - update album',
            artists: results[0],
            genres: results[1],
            album: album,
            errors: errors.array({ onlyFirstError: true }),
          });
        })
        .catch((error) => next(error));
    } else {
      if (!req.file) {
        album.picture_url = req.body.picture_url;
      } else {
        const picture_id = `img-${uuidv4()}`;
        await processImage(req, next, picture_id);
        album.picture_url = `/images/${picture_id}`;
      }
      Album.findByIdAndUpdate(req.params.id, album, (error, updatedAlbum) => {
        if (error) return next(error);
        res.redirect(updatedAlbum.url);
      });
    }
  },
];
