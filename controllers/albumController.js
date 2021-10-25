const Album = require('../models/album');
const Product = require('../models/product');
const mongoose = require('mongoose');

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

exports.album_create_get = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.album_create_post = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

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
