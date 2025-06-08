const amqp = require('amqplib');
const { env } = require('../config');
const { v4: uuidv4 } = require('uuid');
const { EventEmitter } = require('events');
const system = require("../system");

class MessageBroker extends EventEmitter {

    constructor() {
        super();
        this.connection = null;
        
        this.on('connected', () => {
            system.log('[MESSAGE-BROKER] Connected to RabbitMQ');
        });
  
        this.on('error', (err) => {
            system.error('[MESSAGE-BROKER] Connection error occurred:', err.message);
        });
    }

    async getConnection() {
        if (this.connection) return this.connection;

        try {
            this.connection = await amqp.connect(env.MSG_QUEUE_URL);
            this.emit('connected');
            return this.connection;
        } catch (err) {
            this.emit('error', err);
        }
    }

    async run() {
        await this.getConnection();
        system.debug("MessageBroker start");
        setInterval(() => {
            system.debug("MessageBroker is running");
        }, env.HEARTBEAT_INTERVAL_MS);
    }

    async createChannel() {
        try {
            const connection = await this.getConnection();
            const channel = await connection.createChannel();
            return channel;
        } catch (err) {
            this.emit('error', err);
        }
    };

    async sendRpcMessage(channel, queue, requestBody) {
        try {
            // 매 request 마다 할당하기 위한 id 생성
            const correlationId = uuidv4();
            // RpcServer 로부터 응답을 받기 위한 익명큐 하나 선언
            const { queue: replyQueue } = await channel.assertQueue("", { exclusive: true });
            // 해당 consumer 고유 식별 번호
            const consumerTag = uuidv4();

            // 성공/실패에 따라 resolve/reject를 호출할 수 있는 Promise 반환
            return new Promise(function (resolve, reject) {
                // replyQueue로 들어온 메시지 받기
                channel.consume(replyQueue, function (msg) {

                    // 내가 보낸 메시지가 맞다면 resolve 처리
                    if (msg.properties.correlationId === correlationId) {
                        const response = JSON.parse(msg.content.toString());
                        resolve(response);
                        // 메시지를 받았다면 cancel 처리?
                        channel.cancel(consumerTag);
                    }
                }, {
                    noAck: true,
                    consumerTag,
                });

                console.log("[SENT] destination queue : %s, msg : %s", queue.name, JSON.stringify(requestBody));
    
                // 특정 queue로 메시지 전송
                channel.sendToQueue(queue.name, Buffer.from(JSON.stringify(requestBody)), {
                    correlationId,
                    replyTo: replyQueue,
                });

                // 10초 동안 응답이 안오면 cancel 
                setTimeout(function () {
                    channel.cancel(consumerTag);
                    reject(new Error('RPC timeout'));
                }, 10000);
            });
        } catch (err) {
            system.error("[MESSAGE-BROKER] RPC (SEND): ", err.message);
            this.emit('error', err);
        }
    }

    async recieveRpcMessage(channel, queue, onRecieve) {
        try {
            channel.consume(queue.name, async (msg) => {
                if (!msg) return;

                const request = JSON.parse(msg.content.toString());
                const response = await onRecieve(request);

                try {
                    // replyTo 큐로 응답 전송
                    channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
                        correlationId: msg.properties.correlationId
                    });
                } catch (err) {
                    system.error("[MESSAGE-BROKER] RPC (SEND-TO-QUEUE): ", err.message);
                    this.emit('error', err);
                }
                channel.ack(msg);
            });
        } catch (err) {
            system.error("[MESSAGE-BROKER] RPC (RECIEVE): ", err.message);
            this.emit('error', err);
        }
    }

    // 특정 Exchange로 특정 RoutingKey를 가진 메시지 발행
    async publishToExchange(channel, exchange, routingKey, requestBody) {
        try {
            await channel.assertExchange(exchange.name, exchange.type, { durable: exchange.durable });
            channel.publish(exchange.name, routingKey, Buffer.from(JSON.stringify(requestBody)));
            console.log("[SENT] destination exchange : %s, routingKey : %s, msg : %s", exchange.name, routingKey, JSON.stringify(requestBody));
        } catch (err) {
            system.error("[MESSAGE-BROKER] PUBLISH TO EXCHANGE: ", err.message);
            this.emit('error', err);
        }
    }

    // 특정 Exchange로 특정 bindingKey와 매칭되는 메시지 수신
    async subscribeToExchange(channel, exchange, bindingKey, onSubscribe) {
        try {
            await channel.assertExchange(exchange.name, exchange.type, { durable: exchange.durable });

            // Exchange와 연결할 익명 큐 생성
            const anonymous_q = await channel.assertQueue("", { exclusive: true });

            // Exchange와 익명큐 연결
            channel.bindQueue(anonymous_q.queue, exchange.name, bindingKey);

            channel.consume(anonymous_q.queue, function (msg) {
                if (msg.content) {
                    onSubscribe(msg);
                }
                channel.ack(msg);
            },{
                noAck: false,
            });
        } catch (err) {
            system.error("[MESSAGE-BROKER] SUBSCRIBE TO EXCHANGE: ", err.message);
            this.emit('error', err);
        }
    };
}

const messageBroker = new MessageBroker();
module.exports = { messageBroker };