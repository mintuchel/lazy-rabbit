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
            system.info('[MESSAGE-BROKER] Connected to RabbitMQ');
        });
  
        this.on('error', (err) => {
            console.log(err);
            if (err.code === 'ECONNREFUSED') {
                this.connection = null;
                this.retryConnection();
                system.error('[MESSAGE-BROKER] Failed to connect to RabbitMQ. The server may be down or the port may be closed.');
            } else if (err.code === 406 && err.message.includes('PRECONDITION_FAILED')) {
                system.error('[MESSAGE-BROKER] Invalid arguments when declaring exchange or having conflict with existing exchange:', err.message);
            } else {
                system.error('[MESSAGE-BROKER] Connection error:', err.message);
            }
        });

        this.on('timeout', (err) => {
            system.error('[MESSAGE-BROKER] Network Timeout: failed to connect with broker server in 10 sec');
        });

        this.on('close', () => {
            system.error('[MESSAGE-BROKER] Connection closed, retrying...');
            this.connection = null;
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

    async retryConnection() {
        system.info('retryConnection started');
        const TIMEOUT_MS = 5000;
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error());
            }, TIMEOUT_MS)
        });

        try {
            const connection = await Promise.race([
                this.getConnection(),
                timeoutPromise,
            ]);

            console.log('connection re-assigned');
            return connection;
        } catch (err) {
            system.error('connection re-assign failed');
            this.emit('timeout', err);
        }
    }

    async run() {
        await this.getConnection();
        system.info("MessageBroker start");
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

    /**
    * 
    * @param {amqplib.Channel} channel - AMQP channel used for publishing.
    * @param {Object} exchangeDefinition - Exchange configuration (name, type, durable).
    * @param {string} routingKey - Routing key used for message delivery.
    * @param {Object} payload - Message body in JSON format.
    */
    async publishRpcMessage(channel, exchangeDefinition, routingKey, payload) {
        try {
            const correlationId = uuidv4();
            // Consumer로부터 응답을 받기 위한 익명큐 하나 선언
            const { queue: replyQueue } = await channel.assertQueue("", { exclusive: true });
            const consumerTag = uuidv4();

            // 여기 exchangeDefinition.name으로 써줘야함
            await channel.assertExchange(exchangeDefinition, exchangeDefinition.type, { durable: exchangeDefinition.durable || false });

            return new Promise((resolve, reject) => {
                channel.consume(replyQueue, (msg) => {
                    // 내가 보낸 메시지에 대한 응답이 맞다면
                    if (msg.properties.correlationId === correlationId) {
                        const response = JSON.parse(msg.content.toString());
                        resolve(response);
                        channel.cancel(consumerTag);
                    }
                }, {
                    noAck: true,
                    consumerTag,
                });

                // 특정 exchange로 메시지 전송
                // properties로 rpc 메시지 관련 정보 전송
                this.publishToExchange(channel, exchangeDefinition, routingKey, payload, {
                    correlationId,
                    replyTo: replyQueue,
                });

                setTimeout(() => {
                    channel.cancel(consumerTag);
                    reject(new Error('RPC timeout'));
                }, 10000);
            });
        } catch (err) {
            system.error("[MESSAGE-BROKER] RPC (PUBLISH): ", err.message);
            console.dir(err, { depth: null });
            this.emit('error', err);
        }
    }

    /**
    * Subscribes to messages from a specific exchange using the RPC pattern, and sends a response.
    * The onSubscribe callback must return a value which will be sent back as the RPC response.
    *
    * @async
    * @param {amqplib.Channel} channel - The AMQP channel used to set up the subscription.
    * @param {Object} exchangeDefinition - ExchangeDefinition config object.
    * @param {string} bindingKey - The bindingKey used for binding anonymous_q to exchange.
    * @param {function} onSubscribe - Callback function executed when a message is received.
    * 
    * It should return the response to be sent back to the RPC caller.
    */
    async subscribeRpcMessage(channel, exchangeDefinition, bindingKey, onSubscribe) {
        try {
            // 내가 binding할 Exchange 존재하는지 확인
            await channel.assertExchange(exchangeDefinition.name, exchangeDefinition.type, { durable: exchangeDefinition.durable || false });

            // exchange와 바인딩할 익명 큐 선언
            const anonymous_q = await channel.assertQueue("", { exclusive: true });
            // binding 진행
            await channel.bindQueue(anonymous_q.queue, exchangeDefinition.name, bindingKey);

            channel.consume(anonymous_q.queue, async (msg) => {
                if (!msg) return;

                const payload = JSON.parse(msg.content.toString());
                const response = await onSubscribe(payload); // payload에 대한 처리 진행

                // RPC니까 응답 다시 전송해주기
                try {
                    if (msg.properties.replyTo) {
                        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
                            correlationId: msg.properties.correlationId
                        });
                    }
                } catch (err) {
                    system.error("[MESSAGE-BROKER] RPC (SEND-TO-REPLY-QUEUE): ", err.message);
                    this.emit('error', err);
                }
                channel.ack(msg);
            }, { noAck: false });
        } catch (err) {
            system.error("[MESSAGE-BROKER] RPC (SUBSCRIBE): ", err.message);
            this.emit('error', err);
        }
    }

    /**
    * Publishes a message to a specific exchange using the given exchangeDefinition config.
    * This function is called internally in publishRpcMessage
    * @param {amqplib.Channel} channel - AMQP channel used for publishing.
    * @param {Object} exchangeDefinition - Exchange configuration (name, type, durable).
    * @param {string} routingKey - Routing key used for message delivery.
    * @param {Object} payload - Message body in JSON format.
    * @param {Object} [properties={}] - Optional message properties (e.g. for RPC: replyTo, correlationId).
    */
    async publishToExchange(channel, exchangeDefinition, routingKey, payload, messageProperties = {}) {
        try {
            await channel.assertExchange(exchangeDefinition.name, exchangeDefinition.type, { durable: exchangeDefinition.durable || false });
            channel.publish(exchangeDefinition.name, routingKey, Buffer.from(JSON.stringify(payload)), messageProperties);
            system.info("[SENT] destination exchange : %s, routingKey : %s, msg : %s", exchangeDefinition.name, routingKey, JSON.stringify(payload));
        } catch (err) {
            system.error("[MESSAGE-BROKER] PUBLISH TO EXCHANGE: ", err.message);
            this.emit('error', err);
        }
    }

    /**
    * Subscribes to a specific exchange and binds an exclusive, anonymous queue to the given routing key.
    * Messages matching the routing key will trigger the provided callback.
    *
    * @async
    * @param {amqplib.Channel} channel - The AMQP channel used for exchange and queue operations.
    * @param {Object} exchangeDefinition - Exchange configuration (name, type, durable).
    * @param {string} bindingKey - Binding key used for binding anonymous_q to exchange.
    * @param {function} onSubscribe - Callback function executed when a message is received.
    * 
    * It should return the response to be sent back to the RPC caller.
    */
    async subscribeToExchange(channel, exchangeDefinition, bindingKey, onSubscribe) {
        try {
            await channel.assertExchange(exchangeDefinition.name, exchangeDefinition.type, { durable: exchangeDefinition.durable || false});

            const anonymous_q = await channel.assertQueue("", { exclusive: true });

            channel.bindQueue(anonymous_q.queue, exchangeDefinition.name, bindingKey);

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

    shutdown() {
        this.connection = null;
        system.info('[MESSAGE-BROKER] Connection closing...');
    }
}

const messageBroker = new MessageBroker();
module.exports = { messageBroker };