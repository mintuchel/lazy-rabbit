import { createChannel, sendMessage } from "../../rabbitmq/index.js";
import { QueueDefinitions } from "../../rabbitmq/queue/index.js";

const queue = QueueDefinitions.RPC_QUEUE;

export async function sendNotification(message) {
    const channel = await createChannel();
    const result = await sendMessage(channel, queue, message);
    console.log("client recieved : %s", result);
    return result;
}