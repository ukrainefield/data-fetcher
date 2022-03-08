const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const telegramPostSchema = new Schema(
  {
    user: String,
    authorName: String,
    picture: Array,
    video: Array,
    text: String,
    messageId: { type: String, index: true },
    messageURL: String,
    categories: Array,
    time: String,
    epochTime: { type: Number, index: true },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model('telegramPost', telegramPostSchema);
