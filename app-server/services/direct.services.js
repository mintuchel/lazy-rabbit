import { messageBroker } from "../../rabbitmq/index.js";
import { ExchangeDefinitions } from "../../rabbitmq/exchange/index.js";

const channel = await messageBroker.createChannel();
const exchange = ExchangeDefinitions.DIRECT_EXCHANGE;

export async function sendDirectMessage(payload) {
    return await messageBroker.publishMessage(channel, exchange, payload.routingType, payload.message);
}