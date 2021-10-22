const Artist = require('../models/artist');

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

exports.artist_detail = function (req, res) {
  res.send('NOT IMPLEMENTED' + req.params.id);
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
