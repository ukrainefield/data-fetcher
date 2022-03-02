const databasePost = require('./databasePost');
const log = require('fancy-log');
const twitterPostModel = require('../Models/twitterPostModel');

async function postTwitterMessage(message, forceSend = false) {
  log.info(`Recieved Twitter message: ${message.tweetID} by: ${message.authorUsername}`);
  if (!forceSend) {
    let existingPost = await twitterPostModel.findOne({ tweetID: message.tweetID });
    if (existingPost) {
      return;
    }
  }
  databasePost.postTwitterMessageToDatabase(message);
}

module.exports = { postTwitterMessage };
