const log = require('fancy-log');
const cheerio = require('cheerio');
const axios = require('axios').default;
const { TELEGRAM_CHANNELS } = require('../consts');
const postMessage = require('../MessagePost/postMessage');

module.exports = {
  execute: async function () {
    log.info('Fetching Telegram data');
    TELEGRAM_CHANNELS.forEach(async channel => {
      const data = await axios.post(channel.channelURL);
      const $ = cheerio.load(data.data);

      $('.tgme_widget_message').each(function () {
        let messageObject = {
          user: channel.username ?? $(this).find('.tgme_widget_message_user').find('a').attr('href'),
          authorName: $(this).find('.tgme_widget_message_owner_name').find('span').text(),
          picture: undefined,
          video: undefined,
          text: $(this).find('.tgme_widget_message_text').text(),
          id: $(this).attr('data-post'),
          messageURL: '',
          time: $(this).find('.time').attr('datetime'),
          epochTime: '',
        };
        messageObject.messageURL = `https://t.me/${messageObject.id}/`;

        try {
          messageObject.epochTime = new Date(messageObject.time).getTime() / 1000;
        } catch (e) {
          messageObject.epochTime = Math.round(new Date().getTime() / 1000);
        }

        try {
          messageObject.picture = $(this).find('.tgme_widget_message_photo_wrap').attr('style').split("('")[1].split("'")[0];
        } catch (e) {}

        try {
          messageObject.video = $(this).find('.tgme_widget_message_video').attr('src');
        } catch (e) {}

        postMessage.postTelegramMessage(messageObject);
      });
    });
  },
  time: 1000 * 60,
};