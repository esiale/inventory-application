const Format = require('../models/format');

exports.format_list = function (req, res, next) {
  Format.find()
    .sort({ name: 1 })
    .exec(function (err, format_list) {
      if (err) return next(err);
      res.render('format_list', {
        title: 'InventoryApp - formats',
        format_list: format_list,
      });
    });
};

exports.format_detail = function (req, res) {
  res.send('NOT IMPLEMENTED' + req.params.id);
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
