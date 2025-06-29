const MessageBroker = require('../../lib');
const { env } = require('../config');

const messageBroker = new MessageBroker(env.MSG_QUEUE_URL, env.HEARTBEAT_INTERVAL_MS);

// export MessageBroker instance used across example demo app
// this instance is running instance
module.exports = messageBroker;