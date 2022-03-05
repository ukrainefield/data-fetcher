const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reutersMapSchema = new Schema(
  {
    imagePath: String,
    displayUpdatedTime: String,
    messageText: String,
    messageLink: String,
    epochTime: { type: Number, index: true },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model('reutersMap', reutersMapSchema);
