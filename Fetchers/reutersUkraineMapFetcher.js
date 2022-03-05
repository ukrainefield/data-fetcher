const puppeteer = require('puppeteer');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { MEDIA_DIR, REUTERS_MAP_PAGE } = require('../consts');
const postMessage = require('../MessagePost/postMessage');
const log = require('fancy-log');
module.exports = {
  execute: async function () {
    log.info('Fetching Reuters Ukraine map');
    const data = await axios.get(REUTERS_MAP_PAGE);
    const $ = cheerio.load(data.data);

    let epochTime = $('.published > div:nth-child(1) > time:nth-child(1)').attr('datetime');
    const displayUpdatedTime = $('.published > div:nth-child(1) > time:nth-child(1)').text();
    const messageText = $('.svelte-o6k7mu > p').text();
    const messageLink = $('.svelte-o6k7mu > a').attr('href');

    epochTime = new Date(epochTime).getTime() / 1000;

    const message = {
      imagePath: await getBigMap(epochTime),
      epochTime: epochTime,
      displayUpdatedTime: displayUpdatedTime,
      messageText: messageText,
      messageLink: messageLink,
      fileName: `reutersUkraineMap-${epochTime}.png`,
    };

    postMessage.postReutersMap(message);
  },
  time: 1000 * 60 * 5,
};

async function getBigMap(date) {
  const imagePath = path.join(__dirname, '..', MEDIA_DIR, `reutersUkraineMap-${date}.png`);
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(REUTERS_MAP_PAGE, { waitUntil: 'load' });
  await page.waitForSelector('#g-bigmap-box');
  const element = await page.$('#g-bigmap-box');
  await element.screenshot({
    path: imagePath,
    type: 'jpeg',
    quality: 100,
  });
  browser.close();
  return imagePath;
}
