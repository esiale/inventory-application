const Format = require('../models/format');
const Product = require('../models/product');
const mongoose = require('mongoose');

exports.format_list = (req, res, next) => {
  Format.find()
    .sort({ name: 1 })
    .exec((err, format_list) => {
      if (err) return next(err);
      res.render('format_list', {
        title: 'InventoryApp - formats',
        format_list: format_list,
      });
    });
};

exports.format_detail = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const fetch_format = Format.findById(id).sort({ name: 1 }).exec();
  const fetch_products = Product.find({ format: id })
    .sort({ format: 1 })
    .populate({
      path: 'album',
      populate: {
        path: 'artist',
      },
    })
    .exec();
  Promise.all([fetch_format, fetch_products])
    .then((results) => {
      if (results[0] == null) {
        const err = new Error('Format not found');
        err.status = 404;
        return next(err);
      }
      res.render('format_detail', {
        title: `InventoryApp - ${results[0].name}`,
        format_detail: results[0],
        products: results[1],
      });
    })
    .catch((error) => next(error));
};

exports.format_create_get = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.format_create_post = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.format_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.format_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.format_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.format_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED');
};
