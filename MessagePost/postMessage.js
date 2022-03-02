const databasePost = require('./postWorkers/databasePost');
const log = require('fancy-log');
const twitterPostModel = require('../Models/twitterPostModel');

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
  console.log(message);
}

module.exports = { postTwitterMessage, postTelegramMessage };
