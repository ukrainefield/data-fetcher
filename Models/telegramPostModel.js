const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const telegramPostSchema = new Schema(
  {
    user: String,
    authorName: String,
    picture: String,
    video: String,
    text: String,
    messageId: { type: String, index: true },
    messageURL: String,
    categories: Array,
    time: String,
    epochTime: Number,
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model('telegramPost', telegramPostSchema);
