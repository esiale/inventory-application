const Format = require('../models/format');
const Product = require('../models/product');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

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

exports.format_create_get = (req, res, next) => {
  res.render('format_form', { title: 'InventoryApp - add format' });
};

exports.format_create_post = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('* Format name is required')
    .isLength({ max: 50 })
    .withMessage('* Format name must be 50 characters or less')
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    const format = new Format({ name: req.body.name });
    if (!errors.isEmpty()) {
      res.render('format_form', {
        title: 'InventoryApp - add format',
        format: format,
        errors: errors.array({ onlyFirstError: true }),
      });
    } else {
      Format.findOne({ name: req.body.name }).exec((err, found_format) => {
        if (err) return next(err);
        if (found_format) {
          res.redirect(found_format.url);
        } else {
          format.save((err) => {
            if (err) return next(err);
            res.redirect(format.url);
          });
        }
      });
    }
  },
];

exports.format_delete_get = (req, res, next) => {
  const fetch_format = Format.findById(req.params.id).exec();
  const fetch_products = Product.find({ format: req.params.id })
    .populate('album')
    .exec();
  Promise.all([fetch_format, fetch_products])
    .then((results) => {
      if (results[0] === null) return res.redirect('/formats');
      res.render('format_delete', {
        title: 'InventoryApp - delete format',
        format: results[0],
        products: results[1],
      });
    })
    .catch((error) => next(error));
};

exports.format_delete_post = (req, res, next) => {
  const fetch_format = Format.findById(req.params.id).exec();
  const fetch_products = Product.find({ format: req.params.id }).exec();
  Promise.all([fetch_format, fetch_products])
    .then((results) => {
      if (results[1].length > 0) {
        return res.render('format_delete', {
          title: 'InventoryApp - delete format',
          format: results[0],
          products: results[1],
        });
      } else {
        Format.findByIdAndRemove(req.params.id, (error) => {
          if (error) return next(error);
          res.redirect('/formats');
        });
      }
    })
    .catch((error) => next(error));
};

exports.format_update_get = (req, res, next) => {
  Format.findById(req.params.id, (error, results) => {
    if (error) return next(error);
    if (results === null) {
      const error = new Error('Format not found');
      error.status = 404;
      return next(error);
    }
    res.render('format_form', {
      title: 'InventoryApp - update format',
      format: results,
    });
  });
};

exports.format_update_post = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('* Format name is required')
    .isLength({ max: 50 })
    .withMessage('* Format name must be 50 characters or less')
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    const format = new Format({ name: req.body.name, _id: req.params.id });
    if (!errors.isEmpty()) {
      res.render('format_form', {
        title: 'InventoryApp - update format',
        format: format,
        errors: errors.array({ onlyFirstError: true }),
      });
    } else {
      Format.findByIdAndUpdate(
        req.params.id,
        format,
        (error, updatedFormat) => {
          if (error) return next(error);
          res.redirect(updatedFormat.url);
        }
      );
    }
  },
];
