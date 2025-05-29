import { createChannel, publishMessage } from "../../rabbitmq/index.js";
import { ExchangeDefinitions } from "../../rabbitmq/exchange/index.js";

const channel = await createChannel();
const exchange = ExchangeDefinitions.TOPIC_EXCHANGE;

export async function sendTopicMessage(payload) {
    return await publishMessage(channel, exchange, payload.routingType, payload.message);
}