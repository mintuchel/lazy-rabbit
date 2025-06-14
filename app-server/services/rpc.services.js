const { messageBroker } = require("../../rabbitmq");
const { ExchangeDefinitions } = require("../../rabbitmq/exchange");
const { QueueDefinitions } = require("../../rabbitmq/queue");

const exchangeDefinition = ExchangeDefinitions.RPC_EXCHANGE;
const queueDefinition = QueueDefinitions.RPC_REPLY_QUEUE;

const routingKey = 'avocado.rpc';

async function sendRpcMessage(payload) {
    const channel = await messageBroker.createChannel();
    const result = await messageBroker.publishRpcMessage(channel, exchangeDefinition, queueDefinition, routingKey, payload);
    console.log("[RECIEVED] RPCClient: %s", result);
    return result;
}

module.exports = { sendRpcMessage };