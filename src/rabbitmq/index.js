import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config';

let connection;

export async function getConnection() {
    if (connection) return connection;

    connection = await amqp.connect(env.MSG_QUEUE_URL);
    return connection;
}

export async function createChannel() {
    try {
        const connection = getConnection();
        const channel = await connection.createChannel();
        await channel.assertExchange(env.EXCHANGE_NAME, "direct", { durable: true });
        return channel;
    } catch (err) {
        throw err;
    }
};

export async function publishMessage(channel, routingKey, msg) {
    channel.publish(env.EXCHANGE_NAME, routingKey, Buffer.from(msg));
    console.log("[SENT] destination exchange : %s, routingKey : %s, msg : %s", env.EXCHANGE_NAME, routingKey, msg);
}

export async function subscribeMessage(channel, bindingKey) {
    await channel.assertExchange(env.EXCHANGE_NAME, "direct", { durable: true });
    const anonymous_q = await channel.assertQueue("", { exclusive: true });
    
    channel.bindQueue(anonymous_q.queue, env.EXCHANGE_NAME, bindingKey);

    channel.consume(anonymous_q.queue, function (msg) {
        if (msg.content) {
            console.log("the message is:", msg.content.toString());
            service.SubscribeEvents(msg.content.toString());
        }
        channel.ack(msg);
        console.log("[RECIEVED] msg : %s", msg);
    },
    {
        noAck: false,
    }
    );
};