const translate = require('@vitalets/google-translate-api');
const log = require('fancy-log');
const axios = require('axios').default;
async function translateText(text) {
  try {
    const res = await translate(text, { to: 'en' });
    return res.text;
  } catch (e) {
    log.error(e);
    try {
      const translatedMessage = await axios.post(
        'https://libretranslate.de/translate',
        {
          q: text,
          source: 'auto',
          target: 'en',
          format: 'text',
        },
        { 'Content-Type': 'application/json' }
      );
      return translatedMessage.data.translatedText;
    } catch (e) {
      return text;
    }
  }
}

module.exports = { translateText };
