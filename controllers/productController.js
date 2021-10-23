const Product = require('../models/product');
const mongoose = require('mongoose');

exports.product_list = (req, res, next) => {
  const count_products = Product.countDocuments({}).exec();
  const fetch_products = Product.find()
    .sort({ format: 1 })
    .populate('album')
    .populate('format')
    .populate({
      path: 'album',
      populate: { path: 'artist' },
    })
    .exec();
  Promise.all([count_products, fetch_products])
    .then((results) => {
      res.render('index', {
        title: 'InventoryApp - all products',
        product_count: results[0],
        product_list: results[1],
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.product_detail = function (req, res, next) {
  const id = mongoose.Types.ObjectId(req.params.id);
  Product.findById(id)
    .populate('album')
    .populate('format')
    .populate({
      path: 'album',
      populate: { path: 'artist' },
    })
    .exec(function (err, result) {
      if (err) return next(err);
      if (result == null) {
        const err = new Error('Product not found');
        err.status = 404;
        return next(err);
      }
      res.render('product_detail', {
        title: `InventoryApp - ${result.album.name}`,
        result: result,
      });
    });
};

exports.product_create_get = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.product_create_post = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.product_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.product_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.product_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.product_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED');
};
