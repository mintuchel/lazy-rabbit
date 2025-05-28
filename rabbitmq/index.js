import amqp from 'amqplib';
import { env } from '../config/index.js';

let connection;

export async function getConnection() {
    if (connection) return connection;

    connection = await amqp.connect(env.MSG_QUEUE_URL);
    return connection;
}

// 이건 rpc 쓸때 사용하면 안됨
export async function createChannel() {
    try {
        const connection = await getConnection();
        const channel = await connection.createChannel();
        await channel.assertExchange(env.EXCHANGE_NAME, "direct", { durable: false });
        return channel;
    } catch (err) {
        throw err;
    }
};

export async function publishMessage(channel, exchange_type,routingKey, msg) {
    channel.publish(env.EXCHANGE_NAME, routingKey, Buffer.from(msg));
    console.log("[SENT] destination exchange : %s, routingKey : %s, msg : %s", env.EXCHANGE_NAME, routingKey, msg);
}

export async function subscribeMessage(channel, exchange_type, bindingKey) {
    await channel.assertExchange(env.EXCHANGE_NAME, exchange_type, { durable: false });
    const anonymous_q = await channel.assertQueue("", { exclusive: true });
    
    channel.bindQueue(anonymous_q.queue, env.EXCHANGE_NAME, bindingKey);

    channel.consume(anonymous_q.queue, function (msg) {
        if (msg.content) {
            console.log("[RECIEVED] msg content:", msg.content.toString());
        }
        channel.ack(msg);
    },
    {
        noAck: false,
    }
    );
};