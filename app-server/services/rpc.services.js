import { createChannel, sendMessage } from "../../rabbitmq/index.js";
import { QueueDefinitions } from "../../rabbitmq/queue/index.js";

const queue = QueueDefinitions.RPC_QUEUE;

export async function sendNotification(payload) {
    const channel = await createChannel();
    const result = await sendMessage(channel, queue, payload);
    console.log("client recieved : %s", result);
    return result;
}