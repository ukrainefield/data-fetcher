const log = require('fancy-log');
const twitterPostModel = require('../../Models/twitterPostModel');
const telegramPostModel = require('../../Models/telegramPostModel');

async function postTwitterMessageToDatabase(message) {
  log.info(`Posting Tweet message: ${message.tweetID} by ${message.authorUsername} to database`);
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
  newPost.epochTime = message.epochTime;
  newPost.categories = message.categories;
  await newPost.save();
  log.info(`Posted message: ${message.tweetID} to database`);
}

async function postTelegramMessageToDatabase(message) {
  log.info(`Posting Telegram message: ${message.messageId} by ${message.user} to database`);
  const newPost = new telegramPostModel();
  newPost.user = message.user;
  newPost.authorName = message.authorName;
  newPost.picture = message.picture;
  newPost.video = message.video;
  newPost.text = message.text;
  newPost.messageId = message.messageId;
  newPost.messageURL = message.messageURL;
  newPost.categories = message.categories;
  newPost.time = message.time;
  newPost.epochTime = message.epochTime;
  await newPost.save();
  log.info(`Posted message: ${message.messageId} to database`);
}

module.exports = { postTwitterMessageToDatabase, postTelegramMessageToDatabase };
