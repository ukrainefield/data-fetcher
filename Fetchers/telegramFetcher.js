const log = require('fancy-log');
const cheerio = require('cheerio');
const axios = require('axios').default;
const { TELEGRAM_CHANNELS, MEDIA_DIR } = require('../consts');
const postMessage = require('../MessagePost/postMessage');
const translator = require('../Helpers/translator');
const fs = require('fs');
const path = require('path');
const Downloader = require('nodejs-file-downloader');
const fileUpload = require('../Helpers/fileUploader');

module.exports = {
  execute: async function () {
    log.info('Fetching Telegram data');
    TELEGRAM_CHANNELS.forEach(async channel => {
      const data = await axios.post(channel.channelURL);
      const $ = cheerio.load(data.data);

      $('.tgme_widget_message').each(async function () {
        let MessageText = $(this).find('.tgme_widget_message_text').text();

        if (MessageText.includes('| Subscribe')) {
          MessageText = MessageText.split('| Subscribe')[0];
        }

        let messageObject = {
          user: channel.username ?? $(this).find('.tgme_widget_message_user').find('a').attr('href'),
          authorName: $(this).find('.tgme_widget_message_owner_name').find('span').text(),
          picture: undefined,
          video: undefined,
          text: channel.shouldTranslate ? await translator.translateText(MessageText) : MessageText,
          messageId: $(this).attr('data-post'),
          messageURL: '',
          time: $(this).find('.time').attr('datetime'),
          epochTime: '',
          categories: channel.categories,
          friendlyName: channel.friendlyName,
        };
        messageObject.messageURL = `https://t.me/${messageObject.messageId}/`;

        try {
          messageObject.epochTime = new Date(messageObject.time).getTime() / 1000;
        } catch (e) {
          messageObject.epochTime = Math.round(new Date().getTime() / 1000);
        }

        try {
          messageObject.picture = $(this).find('.tgme_widget_message_photo_wrap').attr('style').split("('")[1].split("'")[0];
          if (messageObject.picture) {
            const fileName = `${messageObject.messageId.split('/')[0]}-${messageObject.messageId.split('/')[1]}-image.jpg`;
            const result = await downloadAndUpload(messageObject.picture, fileName, 'picture');
            if (result) {
              messageObject.picture = result.Location;
            }
          }
        } catch (e) {}

        try {
          messageObject.video = $(this).find('.tgme_widget_message_video').attr('src');
          if (messageObject.video) {
            const fileName = `${messageObject.messageId.split('/')[0]}-${messageObject.messageId.split('/')[1]}-video.mp4`;

            const result = await downloadAndUpload(messageObject.video, fileName, 'video');
            if (result) {
              messageObject.video = result.Location;
            }
          }
        } catch (e) {
          log.info(e);
        }

        postMessage.postTelegramMessage(messageObject);
      });
    });
  },
  time: 1000 * 60,
};

async function downloadAndUpload(url, fileName, type) {
  try {
    const downloader = new Downloader({
      url: url,
      directory: path.join(__dirname, '..', MEDIA_DIR),
      fileName: fileName,
    });
    await downloader.download();

    const result = await fileUpload.uploadFile(path.join(__dirname, '..', MEDIA_DIR, fileName), fileName, type);
    try {
      fs.unlinkSync(path.join(__dirname, '..', MEDIA_DIR, fileName));
    } catch (e) {
      log.info(e);
    }
    return result;
  } catch (e) {
    return null;
  }
}
