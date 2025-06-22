const amqp = require('amqplib');
const { env } = require('../demo/config');
const { v4: uuidv4 } = require('uuid');
const { EventEmitter } = require('events');
const system = require("./system");

class MessageBroker extends EventEmitter {

    /**
     * @private
     * A single, shared amqp connection instance.
     * Created once and reused for all operations within this class only.
     * Not exposed outside the MessageBroker class.
     */
    #connection = null;

    constructor() {
        super();

        this.on('connected', () => {
            system.info('[MESSAGE-BROKER] Connected to RabbitMQ');
        });

        this.on('error', (err) => {
            console.log(err);
        });

        this.on('timeout', (err) => {
            system.error('[MESSAGE-BROKER] Network Timeout: failed to connect with broker server in 10 sec');
        });

        this.on('close', () => {
            this.#connection = null;
            system.error('[MESSAGE-BROKER] Connection closed');
        });
    }

    // Initializes the message broker and starts the heartbeat log.
    async run() {
        await this.#createConnection();

        system.info("MessageBroker starting...");

        // Interval to send heartbeats to broker(Defaults to 5 seconds).
        setInterval(() => {
            system.debug("MessageBroker is running");
        }, env.HEARTBEAT_INTERVAL_MS ?? 5000);
    }

    /**
     * @private
     * Creates a shared amqp connection instance.
     */
    async #createConnection() {
        if (this.#connection) return;

        try {
            this.#connection = await amqp.connect(env.MSG_QUEUE_URL);
            this.emit('connected');
        } catch (err) {
            this.emit('error', err);
        }
    }

    /**
     * @private
     * Retrieves the existing amqp connection or creates one if not available.
     * Used in createChannel function
     * @returns {Promise<amqp.Connection>}
     */
    async #getConnection() {
        if (this.#connection) return this.#connection;

        try {
            return await this.#createConnection();
        } catch (err) {
            this.emit('error', err);
        }
    }

    /**
     * Creates and returns a new amqp channel using the current connection.
     * @async
     * @returns {Promise<amqp.Channel>}
     */
    async createChannel() {
        try {
            const connection = await this.#getConnection();
            const channel = await connection.createChannel();
            return channel;
        } catch (err) {
            this.emit('error', err);
        }
    };

    /**
     * @private
     * Declares a queue based on the provided definition.
     * If an empty string is passed as the definition, an exclusive anonymous queue will be created.
     *
     * @async
     * @param {amqplib.Channel} channel - AMQP channel used to declare the queue.
     * @param {Object|string} queueDefinition - Queue configuration object or empty string("") for an anonymous queue.
     *  
     * @returns {Promise<amqplib.Replies.AssertQueue>} The result of the queue declaration, including the queue name and metadata(messageCount, consumerCount).
    */
    async #assertQueue(channel, queueDefinition) {
        try {
            // if queueDefinition is blank, anonymous queue is defined
            if (queueDefinition === "") {
                return await channel.assertQueue("", { exclusive: true, autoDelete: true });
            }

            const { durable, exclusive } = queueDefinition.options || {};
            if (durable === true && exclusive === true) {
                system.warning('[MESSAGE-BROKER] assertQueue: durable=true + exclusive=true may conflict in most use cases.');
            }

            const { name, options } = queueDefinition;
            return await channel.assertQueue(name, options);
        } catch (err) {
            system.error("[MESSAGE-BROKER] #assertQueue Error: ", err.message);
            this.emit('error', err);
        }
    }

    /**
    * Sends an RPC message to a specific exchange and waits for a response. 
    * Publishes a message to the specified exchange using the RPC pattern.
    * Awaits a response on a temporary, exclusive reply queue.
    * 
    * @async
    * @param {amqplib.Channel} channel - amqp channel used for publishing.
    * @param {Object} exchangeDefinition - Exchange configuration (name, type, durable).
    * @param {Object} replyQueueDefintiion - Queue configuration used for replyTo Queue.
    * @param {string} routingKey - Routing key used for message delivery.
    * @param {Object} payload - Message content in JSON format.
    */
    async publishRpcMessage(channel, exchangeDefinition, replyQueueDefinition, routingKey, payload) {
        try {
            const correlationId = uuidv4();

            // queueDefinition을 바탕으로 응답받을 큐 선언
            // 구조분해할당으로 queue 값을 replyQueue로 사용
            const { queue: replyQueue } = await this.#assertQueue(channel, replyQueueDefinition);

            const consumerTag = uuidv4();

            // 메시지 발행할 Exchange 선언
            await channel.assertExchange(exchangeDefinition.name, exchangeDefinition.type, exchangeDefinition.options);

            return new Promise((resolve, reject) => {
                channel.consume(replyQueue, (msg) => {
                    // 내가 보낸 메시지에 대한 응답이 맞다면
                    if (msg.properties.correlationId === correlationId) {
                        // response msg의 content도 JSON 형식으로 옴
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
            system.error("[MESSAGE-BROKER] publishRpcMessage error: ", err.message);
            this.emit('error', err);
        }
    }

    /**
    * Subscribes to messages from a specific exchange using the RPC pattern, and sends a response.
    * The onDispatch callback routes messages to appropriate handlers based on routingKey.
    *
    * @async
    * @param {amqplib.Channel} channel - The amqp channel used to set up the subscription.
    * @param {Object} exchangeDefinition - ExchangeDefinition config object.
    * @param {Object} queueDefinition - QueueDefinition config object.
    * @param {string} bindingKey - The bindingKey used for binding queue of Queuedefinition to exchange.
    * @param {function} onDispatch - dispatch function that routes messages by routingKey to registered handlers.
    * 
    * @returns {Promise<any>} Response from the handler function selected by onDispatch to be sent back as RPC response.
    */
    async subscribeRpcMessage(channel, exchangeDefinition, queueDefinition, bindingKey, onDispatch) {

        try {
            // 내가 binding할 Exchange 존재하는지 확인
            await channel.assertExchange(exchangeDefinition.name, exchangeDefinition.type, exchangeDefinition.options);

            // queueDefinition을 바탕으로 exchange와 바인딩할 큐 선언
            // 구조분해할당으로 queue 값을 replyQueue로 사용
            const { queue: declaredQueue } = await this.#assertQueue(channel, queueDefinition);

            // binding 진행
            await channel.bindQueue(declaredQueue, exchangeDefinition.name, bindingKey);

            channel.consume(declaredQueue, async (msg) => {
                if (!msg) return;

                // msg 객체 그대로 onDispatch 함수에게 전달
                const response = await onDispatch(channel, msg);

                // RPC니까 응답 다시 전송해주기
                try {
                    if (msg.properties.replyTo) {
                        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
                            correlationId: msg.properties.correlationId
                        });
                    }
                } catch (err) {
                    system.error("[MESSAGE-BROKER] subscribeRpcMessage Error(sendToQueue): ", err.message);
                    this.emit('error', err);
                }
                channel.ack(msg);
            }, { noAck: false });
        } catch (err) {
            system.error("[MESSAGE-BROKER] subscribeRpcMessage Error: ", err.message);
            this.emit('error', err);
        }
    }

    /**
    * Publishes a message to a specific exchange using the given exchangeDefinition config.
    * This function is called internally in publishRpcMessage
    * 
    * @async
    * @param {amqplib.Channel} channel - amqp channel used for publishing.
    * @param {Object} exchangeDefinition - Exchange configuration (name, type, durable).
    * @param {string} routingKey - Routing key used for message delivery.
    * @param {Object} payload - Message content in JSON format.
    * @param {Object} [properties={}] - Optional message properties (e.g. for RPC: replyTo, correlationId).
    */
    async publishToExchange(channel, exchangeDefinition, routingKey, payload, messageProperties = {}) {
        try {
            await channel.assertExchange(exchangeDefinition.name, exchangeDefinition.type, exchangeDefinition.options);
            channel.publish(exchangeDefinition.name, routingKey, Buffer.from(JSON.stringify(payload)), messageProperties);
            //system.info("[SENT] destination exchange : %s, routingKey : %s, msg : %s", exchangeDefinition.name, routingKey, JSON.stringify(payload));
        } catch (err) {
            system.error("[MESSAGE-BROKER] publishToExchange Error: ", err.message);
            this.emit('error', err);
        }
    }

    /**
    * Subscribes to a specific exchange and binds an exclusive, anonymous queue to the given routing key.
    * Messages matching the routing key will trigger the provided callback.
    *
    * @async
    * @param {amqplib.Channel} channel - The amqp channel used for exchange and queue operations.
    * @param {Object} exchangeDefinition - Exchange configuration (name, type, durable).
    * @param {Object} queueDefinition - QueueDefinition config object.
    a* @param {string} bindingKey - Binding key used for binding anonymous_q to exchange.
    * @param {function} onDispatch - dispatch function that routes messages by routingKey to registered handlers.
    */
    async subscribeToExchange(channel, exchangeDefinition, queueDefinition, bindingKey, onDispatch) {
        try {
            await channel.assertExchange(exchangeDefinition.name, exchangeDefinition.type, exchangeDefinition.options);

            const { queue: declaredQueue } = await this.#assertQueue(channel, queueDefinition);

            await channel.bindQueue(declaredQueue, exchangeDefinition.name, bindingKey);

            // ack 정상처리는 onDispatch 내부에서만 가능
            // onDispatch 내부에서 ack/nack을 처리하므로 여기서는 하지 않음
            channel.consume(declaredQueue, async function (msg) {
                // amqplib.Message 형식인지 확인
                if (msg && typeof msg === 'object' && msg.content && msg.fields && msg.properties) {
                    try {
                        await onDispatch(channel, msg);
                    } catch (error) {
                        system.error("[MESSAGE-BROKER] Error executing onDispatch:", error.message);
                        // 에러 발생 시 reject (deadletter로 이동)
                        channel.nack(msg, false, false);
                    }
                } else {
                    // 유효하지 않은 메시지 형식이면 nack하고 deadletter로 이동
                    system.warning("[MESSAGE-BROKER] Invalid message format received:", msg);
                    channel.nack(msg, false, false);
                }
            }, {
                noAck: false,
            });
        } catch (err) {
            system.error("[MESSAGE-BROKER] subscribeToExchange Error: ", err.message);
            this.emit('error', err);
        }
    };

    // DLX는 그냥 publish과정만 없는거라고 생각하면 됨
    // publish는 어차피 일반 exchange에서 알아서 해주니까 subscribe해줄 worker만 정의해주면 되는거임
    // DeadLetter 처리하는 subscribe 정의
    // 그럼 Exchange는 언제 정의?
    // 얘가 알아서 assertExchange로 해줌!!
    // deadLetterExchange와 바인딩된 

    // graceful shutdown by waiting to release current connection...
    async shutdown() {
        system.info('[MESSAGE-BROKER] Connection closing...');
        await this.#connection.close();
        this.emit('close');
    }
}

const messageBroker = new MessageBroker();

module.exports = messageBroker;