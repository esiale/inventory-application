const express = require('express');
const router = express.Router();

const album_controller = require('../controllers/albumController');
const artist_controller = require('../controllers/artistController');
const format_controller = require('../controllers/formatController');
const genre_controller = require('../controllers/genreController');
const label_controller = require('../controllers/labelController');

router.get('/', function (req, res) {
  res.send('index');
});

router.get('/album/create', album_controller.album_create_get);
router.post('/album/create', album_controller.album_create_post);

router.get('/album/:id/delete', album_controller.album_delete_get);
router.post('/album/:id/delete', album_controller.album_delete_post);

router.get('/album/:id/update', album_controller.album_update_get);
router.post('/album/:id/update', album_controller.album_update_post);

router.get('/album/:id', album_controller.album_detail);
router.get('/albums', album_controller.album_list);

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

router.get('/label/create', label_controller.label_create_get);
router.post('/label/create', label_controller.label_create_post);

router.get('/label/:id/delete', label_controller.label_delete_get);
router.post('/label/:id/delete', label_controller.label_delete_post);

router.get('/label/:id/update', label_controller.label_update_get);
router.post('/label/:id/update', label_controller.label_update_post);

router.get('/label/:id', label_controller.label_detail);
router.get('/labels', label_controller.label_list);

module.exports = router;
