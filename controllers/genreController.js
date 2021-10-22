const Genre = require('../models/genre');

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

exports.genre_detail = function (req, res) {
  res.send('NOT IMPLEMENTED' + req.params.id);
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
