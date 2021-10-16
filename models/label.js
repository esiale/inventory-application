const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const LabelSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
});

LabelSchema.virtual('url').get(function () {
  return '/label' + this._id;
});

module.exports = mongoose.model('Label', LabelSchema);
