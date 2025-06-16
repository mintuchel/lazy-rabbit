const { messageBroker } = require("../../rabbitmq");
const { ExchangeDefinitions } = require("../../rabbitmq/config/exchange");

let channel;
const exchange = ExchangeDefinitions.NOTIFICATION_EXCHANGE;

async function sendNotificationMessage(payload) {
    if (!channel) {
        channel = await messageBroker.createChannel();
    }
    messageBroker.publishToExchange(channel, exchange, payload.routingType, payload.message);
}

module.exports = { sendNotificationMessage };