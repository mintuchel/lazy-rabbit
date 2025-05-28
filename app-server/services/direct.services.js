import { createChannel, publishMessage } from "../../rabbitmq/index.js";
import { ExchangeDefinitions } from "../../rabbitmq/exchange/index.js";

const channel = await createChannel();
const exchange = ExchangeDefinitions.DIRECT_EXCHANGE;

export async function sendDirectMessage(message) {
    return await publishMessage(channel, exchange, 'A', message);
}