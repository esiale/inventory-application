const Album = require('../models/album');

exports.album_list = function (req, res, next) {
  Album.find()
    .sort({ name: 1 })
    .populate('artist')
    .exec(function (err, album_list) {
      if (err) return next(err);
      res.render('album_list', {
        title: 'InventoryApp - albums',
        album_list: album_list,
      });
    });
};

exports.album_detail = function (req, res) {
  res.send('NOT IMPLEMENTED' + req.params.id);
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
