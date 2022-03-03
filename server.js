const log = require('fancy-log');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { MEDIA_DIR } = require('./consts');
log.info('———— Starting data fetcher Server! ————');

log.info('———— Connecting to MongoDB! ————');
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true });
log.info('———— Connected to MongoDB! ————');

log.info('———— Creating media directory! ————');
if (!fs.existsSync(path.join(__dirname, MEDIA_DIR))) {
  fs.mkdirSync(path.join(__dirname, MEDIA_DIR));
}
fs.readdir(path.join(__dirname, MEDIA_DIR), (err, files) => {
  if (err) throw err;
  for (const file of files) {
    fs.unlink(path.join(__dirname, MEDIA_DIR, file), err => {
      if (err) throw err;
    });
  }
});
log.info('———— Created media directory! ————');

require('./Fetchers/index');

log.info('———— Data fetcher server started! ————');
