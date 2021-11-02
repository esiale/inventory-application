const Artist = require('../models/artist');
const Album = require('../models/album');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const {
  uploadImage,
  processImage,
  validateFile,
  deleteImage,
} = require('../utils/handleImage');
const { body, validationResult } = require('express-validator');

exports.artist_list = (req, res, next) => {
  Artist.find()
    .sort({ name: 1 })
    .exec((err, artist_list) => {
      if (err) return next(err);
      res.render('artist_list', {
        title: 'InventoryApp - artists',
        artist_list: artist_list,
      });
    });
};

exports.artist_detail = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const fetch_artist = Artist.findById(id).sort({ name: 1 }).exec();
  const fetch_albums = Album.find({ artist: id }).sort({ name: 1 }).exec();
  const fetch_products = Album.aggregate([
    {
      $match: { artist: id },
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'album',
        as: 'product_info',
      },
    },
    {
      $unwind: {
        path: '$product_info',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        'product_info._id': 1,
        'product_info.format': 1,
        url: {
          $concat: [
            '/product/',
            {
              $toString: '$product_info._id',
            },
          ],
        },
      },
    },
    {
      $lookup: {
        from: 'formats',
        localField: 'product_info.format',
        foreignField: '_id',
        as: 'product_info.format',
      },
    },
    {
      $unwind: {
        path: '$product_info.format',
      },
    },
    {
      $sort: {
        'product_info.format.name': 1,
      },
    },
  ]).exec();
  Promise.all([fetch_artist, fetch_albums, fetch_products])
    .then((results) => {
      if (results[0] == null) {
        const err = new Error('Artist not found');
        err.status = 404;
        return next(err);
      }
      res.render('artist_detail', {
        title: `InventoryApp - ${results[0].name}`,
        artist_detail: results[0],
        albums: results[1],
        products: results[2],
      });
    })
    .catch((error) => next(error));
};

exports.artist_create_get = (req, res, next) => {
  res.render('artist_form', { title: 'InventoryApp - add artist' });
};

exports.artist_create_post = [
  uploadImage.single('image'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('* Artist name is required')
    .isLength({ max: 50 })
    .withMessage('* Artist name must be 50 characters or less')
    .escape(),
  validateFile,
  (req, res, next) => {
    const errors = validationResult(req);
    const artist = new Artist({ name: req.body.name });
    if (!errors.isEmpty()) {
      res.render('artist_form', {
        title: 'InventoryApp - add artist',
        artist: artist,
        errors: errors.array({ onlyFirstError: true }),
      });
    } else {
      Artist.findOne({ name: req.body.name }).exec(
        async (err, found_artist) => {
          if (err) return next(err);
          if (found_artist) {
            res.redirect(found_artist.url);
          } else {
            if (!req.file) {
              artist.picture_url = '/images/no_image.svg';
            } else {
              const picture_id = `img-${uuidv4()}`;
              await processImage(req, next, picture_id);
              artist.picture_url = `/images/${picture_id}.jpeg`;
            }
            artist.save((err) => {
              if (err) return next(err);
              res.redirect(artist.url);
            });
          }
        }
      );
    }
  },
];

exports.artist_delete_get = (req, res, next) => {
  const fetch_artist = Artist.findById(req.params.id).exec();
  const fetch_albums = Album.find({ artist: req.params.id }).exec();
  Promise.all([fetch_artist, fetch_albums])
    .then((results) => {
      if (results[0] === null) return res.redirect('/artists');
      res.render('artist_delete', {
        title: 'InventoryApp - delete artist',
        artist: results[0],
        albums: results[1],
      });
    })
    .catch((error) => next(error));
};

exports.artist_delete_post = (req, res, next) => {
  const fetch_artist = Artist.findById(req.params.id).exec();
  const fetch_albums = Album.find({ artist: req.params.id }).exec();
  Promise.all([fetch_artist, fetch_albums])
    .then((results) => {
      if (results[1].length > 0) {
        return res.render('artist_delete', {
          title: 'InventoryApp - delete artist',
          artist: results[0],
          albums: results[1],
        });
      } else {
        const delete_artist = Artist.findByIdAndRemove(req.params.id).exec();
        Promise.all([delete_artist, deleteImage(results[0])])
          .then(() => {
            res.redirect('/artists');
          })
          .catch((error) => next(error));
      }
    })
    .catch((error) => next(error));
};

exports.artist_update_get = (req, res, next) => {
  Artist.findById(req.params.id, (error, results) => {
    if (error) return next(error);
    if (results === null) {
      const error = new Error('Artist not found');
      error.status = 404;
      return next(error);
    }
    res.render('artist_form', {
      title: 'InventoryApp - update artist',
      artist: results,
    });
  });
};

exports.artist_update_post = [
  uploadImage.single('image'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('* Artist name is required')
    .isLength({ max: 50 })
    .withMessage('* Artist name must be 50 characters or less')
    .escape(),
  validateFile,
  async (req, res, next) => {
    const errors = validationResult(req);
    const artist = new Artist({ name: req.body.name, _id: req.params.id });
    if (!errors.isEmpty()) {
      res.render('artist_form', {
        title: 'InventoryApp - update artist',
        artist: artist,
        errors: errors.array({ onlyFirstError: true }),
      });
    } else {
      const updateArtist = () => {
        Artist.findByIdAndUpdate(
          req.params.id,
          artist,
          (error, updatedArtist) => {
            if (error) return next(error);
            res.redirect(updatedArtist.url);
          }
        );
      };
      if (!req.file) {
        artist.picture_url = req.body.picture_url;
        updateArtist();
      } else {
        const fetch_artist = Artist.findById(req.params.id).exec();
        await fetch_artist
          .then((result) => {
            const picture_id = `img-${uuidv4()}`;
            Promise.all([
              deleteImage(result),
              processImage(req, next, picture_id),
            ]).then(() => {
              artist.picture_url = `/images/${picture_id}.jpeg`;
              updateArtist();
            });
          })
          .catch((error) => next(error));
      }
    }
  },
];
