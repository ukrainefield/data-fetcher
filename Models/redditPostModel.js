const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const redditPostSchema = new Schema(
  {
    created_at: String,
    postId: { type: String, index: true },
    postUrl: String,
    full_text: String,
    images: Object,
    videos: Object,
    authorUsername: String,
    categories: Array,
    epochTime: { type: Number, index: true },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model('redditPost', redditPostSchema);
