const log = require('fancy-log');
const fs = require('fs');
let fetchers = {};

async function startFetchers() {
  log.info('———— Loading Fetchers... ————');
  let files = fs.readdirSync(__dirname);
  for (let file of files) {
    if (file.endsWith('.js') && !file.startsWith('index')) {
      fetchers[file.slice(0, -3)] = require(__dirname + '/' + file);
      setInterval(function () {
        fetchers[file.slice(0, -3)].execute();
      }, fetchers[file.slice(0, -3)].time);
      fetchers[file.slice(0, -3)].execute();
      log.info(`———— Loading ${file} ————`);
    }
  }
  log.info('———— All Fetchers Loaded! ————');
}

startFetchers();
