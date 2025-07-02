const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');
const { EventEmitter } = require('events');

class MessageBroker extends EventEmitter {

    /**
     * @private
     * A single, shared amqp connection instance.
     * Created once and reused for all operations within this class only.
     * Not exposed outside the MessageBroker class.
     */
    #connection = null;

    constructor(MSG_QUEUE_URL, HEARTBEAT_INTERVAL_MS = 5000) {
        if (!MSG_QUEUE_URL) {
            throw new Error('MSG_QUEUE_URL not declared for MessageBroker');
        }

        super();

        this.MSG_QUEUE_URL = MSG_QUEUE_URL;
        this.HEARTBEAT_INTERVAL_MS = HEARTBEAT_INTERVAL_MS;

        this.on('connected', () => {
            console.info('[MESSAGE-BROKER] connected to RabbitMQ');
        });

        // print err.message + err.stack
        // not throwing new error, application is running but error logs are monitered
        this.on('error', (err) => {
            console.log(err);
        });

        this.on('timeout', (err) => {
            console.error('[MESSAGE-BROKER] network timeout: failed to connect with broker server');
        });

        this.on('close', () => {
            console.error('[MESSAGE-BROKER] connection closed');
        });
    }

    startHeartbeatLog() {
        console.debug("MessageBroker starting...");

        setInterval(() => {
            console.debug("MessageBroker is running");
        }, this.HEARTBEAT_INTERVAL_MS);
    }

    /**
     * @async
     * @private
     * Creates a shared amqp connection instance.
     */
    async #createConnection() {
        if (this.#connection) return this.#connection;

        try {
            this.#connection = await amqp.connect(this.MSG_QUEUE_URL);
            this.emit('connected');
            return this.#connection;
        } catch (err) {
            throw new Error(`Failed to connect to AMQP: ${err.message}`);
        }
    }

    /**
     * @async
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
            throw new Error(`Failed to get AMQP connection: ${err.message}`);
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
            throw new Error(`Failed to create AMQP channel: ${err.message}`);
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
                console.warn('[MESSAGE-BROKER] assertQueue: durable=true + exclusive=true may conflict in most use cases.');
            }

            const { name, options } = queueDefinition;
            return await channel.assertQueue(name, options);
        } catch (err) {
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

            // Declare a reply queue based on the provided definition
            const { queue: replyQueue } = await this.#assertQueue(channel, replyQueueDefinition);

            const consumerTag = uuidv4();

            // Ensure the target exchange exists
            await channel.assertExchange(exchangeDefinition.name, exchangeDefinition.type, exchangeDefinition.options);

            return new Promise((resolve, reject) => {
                // listen for a message with the matching correlationId
                channel.consume(replyQueue, (msg) => {
                    if (msg.properties.correlationId === correlationId) {
                        resolve(msg);
                        // Stop consuming once response is recieved
                        channel.cancel(consumerTag);
                    }
                }, {
                    noAck: false,
                    consumerTag,
                });

                // Publishing message to exchange with RPC properties
                this.publishToExchange(channel, exchangeDefinition, routingKey, payload, {
                    correlationId,
                    replyTo: replyQueue,
                });

                // Stop consuming if timeout
                setTimeout(() => {
                    channel.cancel(consumerTag);
                    reject(new Error('RPC timeout'));
                }, 10000);
            });
        } catch (err) {
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
            // Ensure the target exchange exists before binding
            await channel.assertExchange(exchangeDefinition.name, exchangeDefinition.type, exchangeDefinition.options);

            // Declare queue the worker will be using
            // This queue will be binded to exchange above
            const { queue: declaredQueue } = await this.#assertQueue(channel, queueDefinition);

            // Bind the declared queue to the exchange with the specified binding key
            await channel.bindQueue(declaredQueue, exchangeDefinition.name, bindingKey);

            // Start consuming messages from the queue
            channel.consume(declaredQueue, async (msg) => {
                if (!msg) return;

                // Pass the recieved message to the dispatch function
                const response = await onDispatch(channel, msg);

                // Send a reply back to the producer via the replyTo property
                try {
                    if (msg.properties.replyTo) {
                        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
                            correlationId: msg.properties.correlationId
                        });
                    }
                } catch (err) {
                    this.emit('error', err);
                }
            },
                {
                    noAck: false
                });
        } catch (err) {
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
        } catch (err) {
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

            /**
             * Acknowledgment signal (channel.ack) must be handled exclusively inside the callback triggered by onDispatch.
             * This function delegates message handling responsibility to onDispatch, and does not acknowledge messages here.
             * Acknowledgement signaling is only available in onDispatch
             */

            // Start consuming messages from queue
            channel.consume(declaredQueue, async (msg) => {
                // Check if msg is valid AMQP Message type
                if (msg && typeof msg === 'object' && msg.content && msg.fields && msg.properties && msg.fields.routingKey) {
                    try {
                        await onDispatch(channel, msg);
                    } catch (err) {
                        this.emit('error', err);
                    }
                } else {
                    // If invalid msg type, reject and send it to dlx
                    console.warn("Invalid message format received:", msg);
                    channel.reject(msg, false);
                }
            }, {
                noAck: false,
            });
        } catch (err) {
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
        console.info('[MESSAGE-BROKER] Connection closing...');
        await this.#connection.close();
        this.#connection = null;
        this.emit('close');
    }
}

module.exports = MessageBroker;