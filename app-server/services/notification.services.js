import { messageBroker } from "../../rabbitmq/index.js";
import { ExchangeDefinitions } from "../../rabbitmq/exchange/index.js";

const channel = await messageBroker.createChannel();
const exchange = ExchangeDefinitions.NOTIFICATION_EXCHANGE;

export async function sendNotificationMessage(payload) {
    console.log(payload);
    return await messageBroker.publishToExchange(channel, exchange, payload.routingType, payload.message);
}