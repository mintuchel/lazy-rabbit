import { getConnection } from "../../../config/rbmq.js"
import { v4 as uuidv4 } from 'uuid';

const queueName = "email_rpc_queue";

export async function sendEmailRpcMessage(messagePayload) {
    const conn = await getConnection();
    const channel = await conn.createChannel();

    // 매 request 마다 id 할당해서 보내야함
    const correlationId = uuidv4();
    // 익명 큐 하나를 replyQueue로 생성
    const { queue: replyQueue } = await channel.assertQueue('', { exclusive: true });
    
    // 성공/실패에 따라 resolve/reject를 호출할 수 있는 Promise 반환
    return new Promise(function(resolve, reject) {
        
        // replyQueue로 들어온 메시지 받기
        channel.consume(replyQueue, function (msg) {
            // 내가 보낸 메시지가 맞다면 resolve 처리
            if (msg.properties.correlationId === correlationId) {
                const response = JSON.parse(msg.content.toString());
                resolve(response);
            }
        }, { noAck: true }
        );

        // 요청 메시지 전송
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(messagePayload)), {
            correlationId,
            replyTo: replyQueue,
        });

        // 5초 후에 응답이 안오면 timeout/reject 처리
        setTimeout(function() {
            reject(new Error('RPC timeout'));
        }, 5000);
    });
}