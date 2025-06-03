import { createChannel, publishMessage } from "../../rabbitmq/index.js";
import { ExchangeDefinitions } from "../../rabbitmq/exchange/index.js";

const channel = await createChannel();
const exchange = ExchangeDefinitions.NOTIFICATION_EXCHANGE;

export async function sendNotificationMessage(payload) {
    console.log(payload);
    return await publishMessage(channel, exchange, payload.routingType, payload.message);
}