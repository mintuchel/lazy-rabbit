import { getConnection } from "../rabbitmq/index.js";
import { env } from "../config/index.js";
import { v4 as uuidv4 } from 'uuid';

const queue = env.RPC_QUEUE_NAME;

async function sendNotificationRpcMessage(message) {
    const connection = await getConnection();
    const channel = await connection.createChannel();

    // 매 request 마다 id 할당해서 보내주기
    const correlationId = uuidv4();
    // Notification Sever 로부터 응답을 받기 위한 익명큐 하나 선언
    const { queue: replyQueue } = await channel.assertQueue(queue, { durable: false });
    
    // 성공/실패에 따라 resolve/reject를 호출할 수 있는 Promise 반환
    return new Promise(function (resolve, reject) {
        // replyQueue로 들어온 메시지 받기
        channel.consume(replyQueue, function (msg) {
        
            // 내가 보낸 메시지가 맞다면 resolve 처리
            if (msg.properties.correlationId === correlationId) {
                const response = JSON.parse(msg.content.toString());
                resolve(response);
            }
        }, {
            noAck: true
        });

        // Notification Server에게 메시지 전송
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            correlationId,
            replyTo: replyQueue,
        });

        // 5초 후에 응답이 안오면 timeout/reject 처리
        setTimeout(function () {
            reject(new Error('RPC timeout'));
        }, 5000);
    });
}

export async function sendNotification(msg) {
  // const channel = await createChannel();
  // const result = await publishMessage(channel, routingKey, msg);
  const result = await sendNotificationRpcMessage(msg);
  console.log("result : %s", result);
  return result;
}