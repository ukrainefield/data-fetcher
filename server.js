const log = require('fancy-log');
require('dotenv').config();
const mongoose = require('mongoose');
log.info('———— Starting data fetcher Server! ————');

log.info('———— Connecting to MongoDB! ————');
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true });
log.info('———— Connected to MongoDB! ————');

require('./Fetchers/index');

log.info('———— Data fetcher server started! ————');
