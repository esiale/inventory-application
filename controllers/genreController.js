const Genre = require('../models/genre');
const Album = require('../models/album');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

exports.genre_list = (req, res, next) => {
  Genre.find()
    .sort({ name: 1 })
    .exec((err, genre_list) => {
      if (err) return next(err);
      res.render('genre_list', {
        title: 'InventoryApp - genres',
        genre_list: genre_list,
      });
    });
};

exports.genre_detail = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const fetch_genre = Genre.findById(id).sort({ name: 1 }).exec();
  const fetch_albums = Album.find({ genre: id }).sort({ name: 1 }).exec();
  const fetch_products = Album.aggregate([
    {
      $match: { genre: id },
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
        artist: 1,
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
      $lookup: {
        from: 'artists',
        localField: 'artist',
        foreignField: '_id',
        as: 'product_info.artist',
      },
    },
    {
      $unwind: {
        path: '$product_info.artist',
      },
    },
    {
      $sort: {
        'product_info.format.name': 1,
      },
    },
  ]).exec();
  Promise.all([fetch_genre, fetch_albums, fetch_products])
    .then((results) => {
      if (results[0] == null) {
        const err = new Error('Genre not found');
        err.status = 404;
        return next(err);
      }
      res.render('genre_detail', {
        title: `InventoryApp - ${results[0].name}`,
        genre_detail: results[0],
        albums: results[1],
        products: results[2],
      });
    })
    .catch((error) => next(error));
};

exports.genre_create_get = (req, res, next) => {
  res.render('genre_form', { title: 'InventoryApp - add genre' });
};

exports.genre_create_post = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('* Genre name is required')
    .isLength({ max: 50 })
    .withMessage('* Genre name must be 50 characters or less')
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({ name: req.body.name });
    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'InventoryApp - add genre',
        genre: genre,
        errors: errors.array({ onlyFirstError: true }),
      });
    } else {
      Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
        if (err) return next(err);
        if (found_genre) {
          res.redirect(found_genre.url);
        } else {
          genre.save((err) => {
            if (err) return next(err);
            res.redirect(genre.url);
          });
        }
      });
    }
  },
];

exports.genre_delete_get = (req, res, next) => {
  const fetch_genre = Genre.findById(req.params.id).exec();
  const fetch_albums = Album.find({ genre: req.params.id })
    .populate('artist')
    .exec();
  Promise.all([fetch_genre, fetch_albums])
    .then((results) => {
      if (results[0] === null) return res.redirect('/genres');
      res.render('genre_delete', {
        title: 'InventoryApp - delete genre',
        genre: results[0],
        albums: results[1],
      });
    })
    .catch((error) => next(error));
};

exports.genre_delete_post = (req, res, next) => {
  const fetch_genre = Genre.findById(req.params.id).exec();
  const fetch_albums = Album.find({ genre: req.params.id }).exec();
  Promise.all([fetch_genre, fetch_albums])
    .then((results) => {
      if (results[1].length > 0) {
        return res.render('genre_delete', {
          title: 'InventoryApp - delete genre',
          genre: results[0],
          albums: results[1],
        });
      } else {
        Genre.findByIdAndRemove(req.params.id, (error) => {
          if (error) return next(error);
          res.redirect('/genres');
        });
      }
    })
    .catch((error) => next(error));
};

exports.genre_update_get = (req, res, next) => {
  Genre.findById(req.params.id, (error, results) => {
    if (error) return next(error);
    if (results === null) {
      const error = new Error('Genre not found');
      error.status = 404;
      return next(error);
    }
    res.render('genre_form', {
      title: 'InventoryApp - update genre',
      genre: results,
    });
  });
};

exports.genre_update_post = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('* Genre name is required')
    .isLength({ max: 50 })
    .withMessage('* Genre name must be 50 characters or less')
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({ name: req.body.name, _id: req.params.id });
    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'InventoryApp - update genre',
        genre: genre,
        errors: errors.array({ onlyFirstError: true }),
      });
    } else {
      Genre.findByIdAndUpdate(req.params.id, genre, (error, updatedGenre) => {
        if (error) return next(error);
        res.redirect(updatedGenre.url);
      });
    }
  },
];
