const Genre = require('../models/genre');
const Album = require('../models/album');
const Product = require('../models/product');
const mongoose = require('mongoose');

exports.genre_list = function (req, res, next) {
  Genre.find()
    .sort({ name: 1 })
    .exec(function (err, genre_list) {
      if (err) return next(err);
      res.render('genre_list', {
        title: 'InventoryApp - genres',
        genre_list: genre_list,
      });
    });
};

exports.genre_detail = function (req, res, next) {
  const id = mongoose.Types.ObjectId(req.params.id);
  const fetch_genre = Genre.findById(id).sort({ name: 1 }).exec();
  const fetch_albums = Album.find({ genre: id }).sort({ name: 1 }).exec();
  // const fetch_products = Product.find({ genre: id })
  //   .sort({ format: 1 })
  //   .populate({
  //     path: 'album',
  //     populate: {
  //       path: 'artist',
  //     },
  //   })
  //   .populate('format')
  //   .exec();
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
    .catch((error) => {
      next(error);
    });
};

exports.genre_create_get = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.genre_create_post = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.genre_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.genre_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.genre_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.genre_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED');
};
