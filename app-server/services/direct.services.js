import { createChannel, publishMessage } from "../../rabbitmq/index.js";

const channel = await createChannel();

export async function sendDirectMessage(id, msg) {
    return await publishMessage(channel, id, msg);
}