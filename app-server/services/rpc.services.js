const { messageBroker } = require("../../rabbitmq");
const { QueueDefinitions } = require("../../rabbitmq/queue");

const queue = QueueDefinitions.RPC_QUEUE;

async function sendRpcMessage(payload) {
    const channel = await messageBroker.createChannel();
    const result = await messageBroker.sendRpcMessage(channel, queue, payload);
    console.log("[RECIEVED] RPCClient: %s", result);
    return result;
}

module.exports = { sendRpcMessage };