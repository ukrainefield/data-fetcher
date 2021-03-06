const databasePost = require('./postWorkers/databasePost');
const log = require('fancy-log');
const twitterPostModel = require('../Models/twitterPostModel');
const telegramPostModel = require('../Models/telegramPostModel');
const reutersMapModel = require('../Models/reutersMapModel');
const fileUpload = require('../Helpers/fileUploader');
const { UPLOAD_TRIES } = require('../consts.json');
const translator = require('../Helpers/translator');
const fs = require('fs');

async function postReutersMap(message, forceSend = false) {
  if (!forceSend) {
    let existingPost = await reutersMapModel.findOne({ epochTime: message.epochTime });
    if (existingPost) {
      try {
        fs.unlinkSync(message.imagePath);
      } catch (e) {}
      return;
    }
  }
  log.info(`Recieved Reuters map: ${message.displayUpdatedTime}`);
  const uploadData = await fileUpload.uploadFile(message.imagePath, message.fileName, 'reutersMap');
  message.imagePath = uploadData.Location;
  databasePost.postReutersMapToDatabase(message);
}

async function postTwitterMessage(message, forceSend = false) {
  if (!forceSend) {
    let existingPost = await twitterPostModel.findOne({ tweetID: message.tweetID });
    if (existingPost) {
      return;
    }
  }
  log.info(`Recieved Twitter message: ${message.tweetID} by: ${message.authorUsername}`);
  if (message.shouldTranslate) {
    message.full_text = await translator.translateText(message.full_text);
  }
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
  if (message.shouldTranslate) {
    message.text = await translator.translateText(message.text);
  }
  databasePost.postTelegramMessageToDatabase(message);
}

async function addMediaToTelegramMessage(messageObject) {
  try {
    if (messageObject.picture) {
      let results = [];
      for (let index = 0; index < messageObject.picture.length; index++) {
        const picture = messageObject.picture[index];
        try {
          let tries = 0;
          const fileName = `${messageObject.messageId.split('/')[0]}-${messageObject.messageId.split('/')[1]}-image-${index}.jpg`;
          let result = await fileUpload.downloadAndUpload(picture, fileName, 'picture');
          while (!result && ++tries < UPLOAD_TRIES) {
            result = await fileUpload.downloadAndUpload(picture, fileName, 'picture');
          }
          if (result) {
            results.push(result.Location);
          }
        } catch (e) {
          log.error(e);
        }
      }
      messageObject.picture = results;
    }
  } catch (e) {
    log.info(e);
  }

  try {
    if (messageObject.video) {
      let results = [];
      for (let index = 0; index < messageObject.video.length; index++) {
        const video = messageObject.video[index];
        try {
          const fileName = `${messageObject.messageId.split('/')[0]}-${messageObject.messageId.split('/')[1]}-video-${index}.mp4`;
          let tries = 0;
          let result = await fileUpload.downloadAndUpload(video, fileName, 'video');
          while (!result && ++tries < UPLOAD_TRIES) {
            result = await fileUpload.downloadAndUpload(video, fileName, 'video');
          }
          if (result) {
            results.push(result.Location);
          }
        } catch (e) {
          log.error(e);
        }
      }
      messageObject.video = results;
    }
  } catch (e) {
    log.error(e);
  }
  return messageObject;
}

module.exports = { postTwitterMessage, postTelegramMessage, postReutersMap };
