const databasePost = require('./postWorkers/databasePost');
const log = require('fancy-log');
const twitterPostModel = require('../Models/twitterPostModel');
const telegramPostModel = require('../Models/telegramPostModel');

async function postTwitterMessage(message, forceSend = false) {
  if (!forceSend) {
    let existingPost = await twitterPostModel.findOne({ tweetID: message.tweetID });
    if (existingPost) {
      return;
    }
  }
  log.info(`Recieved Twitter message: ${message.tweetID} by: ${message.authorUsername}`);
  databasePost.postTwitterMessageToDatabase(message);
}

async function postTelegramMessage(message, forceSend = false) {
  if (!forceSend) {
    let existingPost = await telegramPostModel.findOne({ id: message.id });
    if (existingPost) {
      return;
    }
  }
  log.info(`Recieved Telegram message: ${message.id} by: ${message.user}`);
  databasePost.postTelegramMessageToDatabase(message);
}

module.exports = { postTwitterMessage, postTelegramMessage };
