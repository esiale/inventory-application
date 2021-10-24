const Artist = require('../models/artist');
const Album = require('../models/album');
const mongoose = require('mongoose');

exports.artist_list = function (req, res, next) {
  Artist.find()
    .sort({ name: 1 })
    .exec(function (err, artist_list) {
      if (err) return next(err);
      res.render('artist_list', {
        title: 'InventoryApp - artists',
        artist_list: artist_list,
      });
    });
};

exports.artist_detail = function (req, res, next) {
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
    .catch((error) => {
      next(error);
    });
};

exports.artist_create_get = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.artist_create_post = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.artist_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.artist_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.artist_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.artist_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED');
};
