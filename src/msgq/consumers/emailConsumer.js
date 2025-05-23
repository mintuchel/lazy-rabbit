import { getConnection } from "../../../config/rbmq.js"
import dotenv from 'dotenv';

dotenv.config();

const queueName = process.env.EMAIL_RPC_QUEUE;

export async function recieveEmailRpcMessage(handleMessage) {
    const conn = await getConnection();
    const channel = await conn.createChannel();

    // 존재한다면 기존 큐 사용, 아니면 새로운 큐 생성
    // durable로 인해 서버가 다운되어도 떠있음
    await channel.assertQueue(queueName, { durable: true });

    console.log(" [x] Awaiting RPC requests on %s", queueName);

    channel.consume(queueName, async function (msg) {
        if (!msg) return;

        const messagePayload = JSON.parse(msg.content.toString())

        try {
            const responsePayload = await handleMessage(messagePayload);

            channel.sendToQueue(msg.properties.replyTo,
                Buffer.from(JSON.stringify(responsePayload)), {
                    correlationId: msg.properties.correlationId
                }
            );
        } catch (err) {
            console.error('Error handling RPC request:', err);
        }

        channel.ack(msg);
    });
}