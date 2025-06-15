const { messageBroker } = require("../../rabbitmq");
const { ExchangeDefinitions } = require("../../rabbitmq/config/exchange");

let channel;
const exchange = ExchangeDefinitions.DIRECT_EXCHANGE;

async function sendDirectMessage(payload) {
    if (!channel) {
        channel = await messageBroker.createChannel();
    }
    return await messageBroker.publishToExchange(channel, exchange, payload.routingType, payload.message);
}

module.exports = { sendDirectMessage };