const Product = require('../models/product');

exports.product_list = (req, res, next) => {
  const count_products = Product.countDocuments({}).exec();
  const fetch_products = Product.find({})
    .sort({ title: 1 })
    .populate('album')
    .populate('format')
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

exports.product_detail = function (req, res) {
  res.send('NOT IMPLEMENTED' + req.params.id);
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
