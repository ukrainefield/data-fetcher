const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const twitterPostSchema = new Schema(
  {
    created_at: String,
    tweetID: { type: String, index: true },
    tweetURL: String,
    full_text: String,
    images: Object,
    videos: Object,
    authorID: String,
    authorUsername: String,
    authorDisplayName: String,
    profileImage: String,
    categories: Array,
    epochTime: Number,
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model('twitterPost', twitterPostSchema);
