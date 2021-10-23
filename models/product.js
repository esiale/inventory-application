const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  album: { type: Schema.Types.ObjectId, ref: 'Album', required: true },
  artist: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
  format: { type: Schema.Types.ObjectId, ref: 'Format', required: true },
  genre: [{ type: Schema.Types.ObjectId, ref: 'Genre', required: true }],
  price: { type: Number, required: true },
  number_in_stock: { type: Number, required: true },
});

ProductSchema.virtual('url').get(function () {
  return '/product/' + this._id;
});

module.exports = mongoose.model('Product', ProductSchema);
