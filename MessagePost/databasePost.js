const log = require('fancy-log');
const twitterPostModel = require('../Models/twitterPostModel');

async function postTwitterMessageToDatabase(message) {
  log.info(`Posting message: ${message.tweetID} to database`);
  const newPost = new twitterPostModel();
  newPost.created_at = message.created_at;
  newPost.tweetID = message.tweetID;
  newPost.full_text = message.full_text;
  newPost.images = message.images;
  newPost.videos = message.videos;
  newPost.authorID = message.authorID;
  newPost.authorUsername = message.authorUsername;
  newPost.authorDisplayName = message.authorDisplayName;
  newPost.profileImage = message.profileImage;
  newPost.epochTime = new Date(message.created_at).getTime() / 1000;
  await newPost.save();
  log.info(`Posted message: ${message.tweetID} to database`);
}

module.exports = { postTwitterMessageToDatabase };
