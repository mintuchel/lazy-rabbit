const { messageBroker } = require("../../rabbitmq");
const { ExchangeDefinitions } = require("../../rabbitmq/config/exchange");

let channel;
const exchange = ExchangeDefinitions.NOTIFICATION_EXCHANGE;

async function sendNotificationMessage(payload) {
    if (!channel) {
        channel = await messageBroker.createChannel();
    }
    console.log(payload);
    return await messageBroker.publishToExchange(channel, exchange, payload.routingType, payload.message);
}

module.exports = { sendNotificationMessage };