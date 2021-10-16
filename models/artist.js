const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ArtistSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  picture_url: { type: String },
});

ArtistSchema.virtual('url').get(function () {
  return '/artist' + this._id;
});

module.exports = mongoose.model('Artist', ArtistSchema);
