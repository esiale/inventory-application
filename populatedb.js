#! /usr/bin/env node

const userArgs = process.argv.slice(2);
const Album = require('./models/album');
const AlbumInstance = require('./models/albumInstance');
const Artist = require('./models/artist');
const Format = require('./models/format');
const Genre = require('./models/genre');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const albums = [];
const albumInstances = [];
const artists = [];
const formats = [];
const genres = [];

const albumCreate = (name, artist, released, genre, label, picture_url) => {
  const albumdetail = {
    name: name,
    artist: artist,
    released: released,
    genre: genre,
    label: label,
    picture_url: picture_url,
  };

  const album = new Album(albumdetail);

  return album.save().then(() => {
    console.log('New Album: ' + album);
    albums.push(album);
  });
};

const albumInstanceCreate = (album, format, price, number_in_stock) => {
  const albumInstance = new AlbumInstance({
    album: album,
    format: format,
    price: price,
    number_in_stock: number_in_stock,
  });

  return albumInstance.save().then(() => {
    console.log('New Album Instance: ' + albumInstance);
    albumInstances.push(albumInstance);
  });
};

const artistCreate = (name, picture_url) => {
  const artist = new Artist({ name: name, picture_url: picture_url });

  return artist.save().then(() => {
    console.log('New Artist: ' + artist);
    artists.push(artist);
  });
};

const formatCreate = (name) => {
  const format = new Format({ name: name });

  return format.save().then(() => {
    console.log('New Format: ' + format);
    formats.push(format);
  });
};

const genreCreate = (name) => {
  const genre = new Genre({ name: name });

  return genre.save().then(() => {
    console.log('New Genre: ' + genre);
    genres.push(genre);
  });
};

const createFormats = async () => {
  return await formatCreate('Audio CD').then(() => formatCreate('Vinyl'));
};

const createGenres = async () => {
  return await genreCreate('Progressive rock')
    .then(() => genreCreate('Acoustic rock'))
    .then(() => genreCreate('Indie folk'));
};

const createArtists = async () => {
  return await artistCreate('Pink Floyd', '/images/pinkfloyd.jpg').then(() =>
    artistCreate('John Frusciante', '/images/frusciante.jpg')
  );
};

const createAlbums = async () => {
  return await albumCreate(
    'The Wall',
    artists[0],
    '1979',
    genres[0],
    'Harvest (UK) &bull; Columbia (US)',
    '/images/pinkfloyd_thewall.jpg'
  )
    .then(() =>
      albumCreate(
        'The Division Bell',
        artists[0],
        '1994',
        genres[0],
        'EMI',
        '/images/pinkfloyd_thedivisionbell.jpg'
      )
    )
    .then(() =>
      albumCreate(
        'Curtains',
        artists[1],
        '2005',
        [genres[1], genres[2]],
        'Record Collection',
        '/images/frusciante_curtains.jpg'
      )
    );
};

const createAlbumInstances = async () => {
  const theWallCD = albumInstanceCreate(albums[0], formats[0], 17.0, 9);
  const theWallVinyl = albumInstanceCreate(albums[0], formats[1], 51.99, 3);
  const theDivisionBellCD = albumInstanceCreate(
    albums[1],
    formats[0],
    10.99,
    5
  );
  const theDivisionBellVinyl = albumInstanceCreate(
    albums[1],
    formats[1],
    30.43,
    2
  );
  const curtainsCD = albumInstanceCreate(albums[2], formats[0], 36.94, 2);

  return Promise.all([
    theWallCD,
    theWallVinyl,
    theDivisionBellCD,
    theDivisionBellVinyl,
    curtainsCD,
  ]);
};

const populate = () => {
  Promise.all([createFormats(), createGenres(), createArtists()])
    .then(() => createAlbums())
    .then(() => createAlbumInstances())
    .catch((error) => {
      console.log(error);
    })
    .finally(() => mongoose.connection.close());
};

const mongoDB = userArgs[0];
try {
  mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  populate();
} catch (error) {
  console.log(error);
}
