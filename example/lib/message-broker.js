const { MessageBroker } = require("../../lib");
const { env } = require("../config");

const messageBroker = new MessageBroker(env.MSG_QUEUE_URL);

// export MessageBroker instance used across example demo app
module.exports = messageBroker;