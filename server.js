const log = require('fancy-log');
require('dotenv').config();
log.info(`Starting data fetcher server...`);

require('./Fetchers/index');
