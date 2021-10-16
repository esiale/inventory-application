const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AlbumSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  artist: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
  released: { type: Date, required: true },
  genre: { type: Schema.Types.ObjectId, ref: 'Genre' },
  format: { type: Schema.Types.ObjectId, format: 'Format' },
  price: { type: Number, required: true },
  number_in_stock: { type: Number, required: true },
  picture_url: { type: String },
});

AlbumSchema.virtual('url').get(function () {
  return '/album' + this._id;
});
