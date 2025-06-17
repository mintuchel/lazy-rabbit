const messageBroker = require("../../rabbitmq");
const ExchangeDefinitions = require("../../rabbitmq/config/exchange");
const system = require("../../system");

let channel;

async function sendDirectMessage(payload) {
    if (!channel) {
        channel = await messageBroker.createChannel();
    }
    messageBroker.publishToExchange(channel, ExchangeDefinitions.DIRECT_EXCHANGE, payload.routingType, payload.message);
}

async function sendLogMessage(payload) {
    if (!channel) {
        channel = await messageBroker.createChannel();
    }
    messageBroker.publishToExchange(channel, ExchangeDefinitions.LOGGER_EXCHANGE, payload.routingType, payload.message);
}

module.exports = { sendDirectMessage, sendLogMessage };