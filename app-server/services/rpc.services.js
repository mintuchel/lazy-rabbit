const { messageBroker } = require("../../rabbitmq");
const { ExchangeDefinitions } = require("../../rabbitmq/exchange");

const exchangeDefinition = ExchangeDefinitions.RPC_EXCHANGE;
const routingKey = 'avocado.rpc';

async function sendRpcMessage(payload) {
    const channel = await messageBroker.createChannel();
    const result = await messageBroker.publishRpcMessage(channel, exchangeDefinition, routingKey, payload);
    console.log("[RECIEVED] RPCClient: %s", result);
    return result;
}

module.exports = { sendRpcMessage };