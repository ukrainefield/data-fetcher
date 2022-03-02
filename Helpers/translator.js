const translate = require('@vitalets/google-translate-api');
async function translateText(text) {
  try {
    const res = await translate(text, { to: 'en' });
    return res.text;
  } catch (e) {
    return text;
  }
}

module.exports = { translateText };
