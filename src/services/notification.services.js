import { createChannel, publishMessage } from "../rabbitmq/index.js";

const routingKey = 'service.notification';

export async function sendNotification(msg) {
  const channel = await createChannel();
  const result = await publishMessage(channel, routingKey, msg);
  console.log("result : %s", result);
  return result;
}