const Product = require('../models/product');
const Album = require('../models/album');
const Format = require('../models/format');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

exports.product_list = (req, res, next) => {
  const count_products = Product.countDocuments({}).exec();
  const fetch_products = Product.find()
    .sort({ format: 1 })
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
    .catch((error) => next(error));
};

exports.product_detail = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  Product.findById(id)
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

exports.product_create_get = (req, res, next) => {
  const fetch_albums = Album.find().exec();
  const fetch_formats = Format.find().exec();
  Promise.all([fetch_albums, fetch_formats])
    .then((results) => {
      res.render('product_form', {
        title: 'InventoryApp - add product',
        albums: results[0],
        formats: results[1],
      });
    })
    .catch((error) => next(error));
};

exports.product_create_post = [
  body('album').trim().notEmpty().withMessage('* Album is required').escape(),
  body('price')
    .trim()
    .notEmpty()
    .withMessage('* Price is required')
    .isInt()
    .withMessage('* Price must be a number')
    .escape(),
  body('number_in_stock')
    .trim()
    .notEmpty()
    .withMessage('* Number in stock is required')
    .isInt()
    .withMessage('* Number in stock must be a number')
    .escape(),
  body('format').trim().notEmpty().withMessage('* Format is required').escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    const product = new Product({
      album: req.body.album,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      format: req.body.format,
    });
    if (!errors.isEmpty()) {
      const fetch_albums = Album.find().exec();
      const fetch_formats = Format.find().exec();
      Promise.all([fetch_albums, fetch_formats]).then((results) => {
        res.render('product_form', {
          title: 'InventoryApp - add product',
          albums: results[0],
          formats: results[1],
          product: product,
          errors: errors.array({ onlyFirstError: true }),
        });
      });
    } else {
      Product.findOne({
        album: req.body.album,
        format: req.body.format,
      }).exec((err, found_product) => {
        if (err) return next(err);
        if (found_product) {
          res.redirect(found_product.url);
        } else {
          product.save((err) => {
            if (err) return next(err);
            res.redirect(product.url);
          });
        }
      });
    }
  },
];

exports.product_delete_get = (req, res, next) => {
  Product.findById(req.params.id)
    .populate('album')
    .populate('format')
    .exec((error, results) => {
      if (error) return next(error);
      if (results === null) return res.redirect('/products');
      res.render('product_delete', {
        title: 'InventoryApp - delete artist',
        product: results,
      });
    });
};

exports.product_delete_post = (req, res, next) => {
  Product.findByIdAndRemove(req.params.id, (error) => {
    if (error) return next(error);
    res.redirect('/products');
  });
};

exports.product_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED');
};

exports.product_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED');
};
