const express = require('express');
const router = express.Router();

const album_controller = require('../controllers/albumController');
const product_controller = require('../controllers/productController');
const artist_controller = require('../controllers/artistController');
const format_controller = require('../controllers/formatController');
const genre_controller = require('../controllers/genreController');

router.get('/', function (req, res) {
  res.redirect('/products');
});

router.get('/album/create', album_controller.album_create_get);
router.post('/album/create', album_controller.album_create_post);

router.get('/album/:id/delete', album_controller.album_delete_get);
router.post('/album/:id/delete', album_controller.album_delete_post);

router.get('/album/:id/update', album_controller.album_update_get);
router.post('/album/:id/update', album_controller.album_update_post);

router.get('/album/:id', album_controller.album_detail);
router.get('/albums', album_controller.album_list);

router.get('/product/create', product_controller.product_create_get);
router.post('/product/create', product_controller.product_create_post);

router.get('/product/:id/delete', product_controller.product_delete_get);
router.post('/product/:id/delete', product_controller.product_delete_post);

router.get('/product/:id/update', product_controller.product_update_get);
router.post('/product/:id/update', product_controller.product_update_post);

router.get('/product/:id', product_controller.product_detail);
router.get('/products', product_controller.product_list);

router.get('/artist/create', artist_controller.artist_create_get);
router.post('/artist/create', artist_controller.artist_create_post);

router.get('/artist/:id/delete', artist_controller.artist_delete_get);
router.post('/artist/:id/delete', artist_controller.artist_delete_post);

router.get('/artist/:id/update', artist_controller.artist_update_get);
router.post('/artist/:id/update', artist_controller.artist_update_post);

router.get('/artist/:id', artist_controller.artist_detail);
router.get('/artists', artist_controller.artist_list);

router.get('/genre/create', genre_controller.genre_create_get);
router.post('/genre/create', genre_controller.genre_create_post);

router.get('/genre/:id/delete', genre_controller.genre_delete_get);
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

router.get('/genre/:id/update', genre_controller.genre_update_get);
router.post('/genre/:id/update', genre_controller.genre_update_post);

router.get('/genre/:id', genre_controller.genre_detail);
router.get('/genres', genre_controller.genre_list);

router.get('/format/create', format_controller.format_create_get);
router.post('/format/create', format_controller.format_create_post);

router.get('/format/:id/delete', format_controller.format_delete_get);
router.post('/format/:id/delete', format_controller.format_delete_post);

router.get('/format/:id/update', format_controller.format_update_get);
router.post('/format/:id/update', format_controller.format_update_post);

router.get('/format/:id', format_controller.format_detail);
router.get('/formats', format_controller.format_list);

module.exports = router;
