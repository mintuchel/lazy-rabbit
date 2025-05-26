import { getConnection } from "../rabbitmq/index.js";
import { env } from "../config/index.js";

const queue = env.RPC_QUEUE_NAME;

async function recieveEmailRpcMessage(handleMessage) {
    const connection = await getConnection();
    const channel = await connection.createChannel();

    // 존재한다면 기존 큐 사용, 아니면 새로운 큐 생성
    // durable로 인해 서버가 다운되어도 떠있음
    await channel.assertQueue(queue, { durable: false });

    console.log(env.RPC_QUEUE_NAME);
    console.log(queue);
    console.log(" [x] Awaiting RPC requests on %s", queue);

    channel.consume(queue, async function (msg) {
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

// 위 함수의 handleMessage 인자로는 콜백함수가 들어감
// 그 콜백함수는 payload라는 인자를 받아 처리하는 함수
recieveEmailRpcMessage(async function(payload) {
    console.log('RPC Request Received:', payload);
    // 작업 처리 후 응답 반환
    return {
        success: true, message: `Email sent to ${payload.email}`
    };
});