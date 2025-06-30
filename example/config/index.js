const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

// load .env
const env = {
  HEARTBEAT_INTERVAL_MS: process.env.HEARTBEAT_INTERVAL_MS,
  MSG_QUEUE_URL: process.env.MSG_QUEUE_URL,
};

module.exports = { env };