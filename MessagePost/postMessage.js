const databasePost = require('./postWorkers/databasePost');
const log = require('fancy-log');
const twitterPostModel = require('../Models/twitterPostModel');
const telegramPostModel = require('../Models/telegramPostModel');
const fileUpload = require('../Helpers/fileUploader');

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
    let existingPost = await telegramPostModel.findOne({ messageId: message.messageId });
    if (existingPost) {
      return;
    }
  }
  message = await addMediaToTelegramMessage(message);
  log.info(`Recieved Telegram message: ${message.messageId} by: ${message.user}`);
  databasePost.postTelegramMessageToDatabase(message);
}

async function addMediaToTelegramMessage(messageObject) {
  try {
    if (messageObject.picture) {
      const fileName = `${messageObject.messageId.split('/')[0]}-${messageObject.messageId.split('/')[1]}-image.jpg`;
      const result = await fileUpload.downloadAndUpload(messageObject.picture, fileName, 'picture');
      if (result) {
        messageObject.picture = result.Location;
      }
    }
  } catch (e) {
    log.info(e);
  }

  try {
    if (messageObject.video) {
      const fileName = `${messageObject.messageId.split('/')[0]}-${messageObject.messageId.split('/')[1]}-video.mp4`;

      const result = await fileUpload.downloadAndUpload(messageObject.video, fileName, 'video');
      if (result) {
        messageObject.video = result.Location;
      }
    }
  } catch (e) {
    log.info(e);
  }
  return messageObject;
}

module.exports = { postTwitterMessage, postTelegramMessage };
