import amqp from 'amqplib';
import { env } from '../config/index.js';
import { v4 as uuidv4 } from 'uuid';

let connection;

export async function getConnection() {
    if (connection) return connection;

    connection = await amqp.connect(env.MSG_QUEUE_URL);
    return connection;
}

export async function createChannel() {
    try {
        const connection = await getConnection();
        const channel = await connection.createChannel();
        return channel;
    } catch (err) {
        throw err;
    }
};

export async function sendMessage(channel, queue, requestBody) {

    // 매 request 마다 할당하기 위한 id 생성
    const correlationId = uuidv4();
    // RpcServer 로부터 응답을 받기 위한 익명큐 하나 선언
    const { queue: replyQueue } = await channel.assertQueue("", { exclusive: true });
    // 해당 producer 고유 식별 번호
    const producerTag = uuidv4();

    // 성공/실패에 따라 resolve/reject를 호출할 수 있는 Promise 반환
    return new Promise(function (resolve, reject) {
        // replyQueue로 들어온 메시지 받기
        channel.consume(replyQueue, function (msg) {
        
            // 내가 보낸 메시지가 맞다면 resolve 처리
            if (msg.properties.correlationId === correlationId) {
                const response = JSON.parse(msg.content.toString());
                resolve(response);
                // 메시지를 받았을때는 현 producer 중지
                // 더 이상 replyQueue에서 메시지를 받지 않도록 현 producer로 정리
                channel.cancel(producerTag);
            }
        }, {
            noAck: true,
            producerTag, // consumerTag: producerTag
        });

        // 특정 queue로 메시지 전송
        channel.sendToQueue(queue.name, Buffer.from(JSON.stringify(requestBody)), {
            correlationId,
            replyTo: replyQueue,
        });

        // 5초 후에 응답이 안오면 timeout/reject 처리
        setTimeout(function () {
            channel.cancel(producerTag);
            reject(new Error('RPC timeout'));
        }, 5000);
    });
}

// 특정 Exchange로 특정 RoutingKey를 가진 메시지 발행
export async function publishMessage(channel, exchange, routingKey, msg) {
    await channel.assertExchange(exchange.name, exchange.type, { durable: exchange.durable });
    channel.publish(exchange.name, routingKey, Buffer.from(msg));
    console.log("[SENT] destination exchange : %s, routingKey : %s, msg : %s", exchange.name, routingKey, msg);
}

// 특정 Exchange로 특정 bindingKey와 매칭되는 메시지 수신
export async function subscribeMessage(channel, exchange, bindingKey) {
    await channel.assertExchange(exchange.name, exchange.type, { durable: exchange.durable });

    // Exchange와 연결할 익명 큐 생성
    const anonymous_q = await channel.assertQueue("", { exclusive: true });
    
    // Exchange와 익명큐 연결
    channel.bindQueue(anonymous_q.queue, exchange.name, bindingKey);

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