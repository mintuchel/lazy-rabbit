import { connect, Channel, Message, ChannelModel, Replies } from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { ExchangeConfig, QueueConfig, MessageProperties, Handler } from '../types';

export class MessageBroker extends EventEmitter {

    /**
     * @private
     * A single, shared amqp connection instance.
     * Created once and reused for all operations within this class only.
     * Not exposed outside the MessageBroker class.
     */
    private connection: ChannelModel | null = null;

    private MSG_QUEUE_URL: string;
    public HEARTBEAT_INTERVAL_MS: number;

    constructor(MSG_QUEUE_URL: string, HEARTBEAT_INTERVAL_MS: number = 5000) {
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
        this.on('error', (err: Error) => {
            console.log(err);
        });

        this.on('timeout', (err: Error) => {
            console.error('[MESSAGE-BROKER] network timeout: failed to connect with broker server');
        });

        this.on('close', () => {
            console.error('[MESSAGE-BROKER] connection closed');
        });
    }

    startHeartbeatLog(): void {
        console.debug("MessageBroker starting...");

        setInterval(() => {
            console.debug("MessageBroker is running");
        }, this.HEARTBEAT_INTERVAL_MS);
    }

    /**
     * Creates a shared amqp connection instance.
     * 
     * @async
     * @private
     */
    private async createConnection(): Promise<ChannelModel> {
        if (this.connection) return this.connection;

        try {
            this.connection = await connect(this.MSG_QUEUE_URL);
            this.emit('connected');
            return this.connection;
        } catch (err) {
            throw new Error(`Failed to connect to AMQP: ${(err as Error).message}`);
        }
    }

    /**
     * Retrieves the existing amqp connection or creates one if not available.
     * Used in createChannel function
     * 
     * @async
     * @private
     * @returns {Promise<ChannelModel>}
     */
    private async getConnection(): Promise<ChannelModel> {
        if (this.connection) return this.connection;

        try {
            return await this.createConnection();
        } catch (err) {
            throw new Error(`Failed to get AMQP connection: ${(err as Error).message}`);
        }
    }

    /**
     * Creates and returns a new amqp channel using the current connection.
     * 
     * @async
     * @returns {Promise<Channel>}
     */
    async createChannel(): Promise<Channel> {
        try {
            const connection = await this.getConnection();
            const channel = await connection.createChannel();
            return channel;
        } catch (err) {
            throw new Error(`Failed to create AMQP channel: ${(err as Error).message}`);
        }
    }

    /**
     * Declares a queue based on the provided definition.
     * If no config is passed, an anonymous queue will be created.
     *
     * @async
     * @private
     * @param {Channel} channel - AMQP channel used to declare the queue.
     * @param {QueueConfig} queueConfig - Queue configuration
     * @returns {Promise<Replies.AssertQueue>}
    */
    private async assertQueue(channel: Channel, queueConfig?: QueueConfig): Promise<Replies.AssertQueue> {
        try {
            // if queueConfig is undefined, anonymous queue is defined
            if (!queueConfig) {
                return await channel.assertQueue("", { exclusive: true, autoDelete: true });
            }

            const { durable, exclusive } = queueConfig.options || {};

            if (durable === true && exclusive === true) {
                console.warn('[MESSAGE-BROKER] assertQueue: durable=true + exclusive=true may conflict in most use cases.');
            }

            const { name, options } = queueConfig;

            return await channel.assertQueue(name, options);
        } catch (err) {
            this.emit('error', err);
            throw err;
        }
    }

    /**
    * Sends an RPC message to a specific exchange and waits for a response. 
    * Publishes a message to the specified exchange using the RPC pattern.
    * 
    * @async
    * @param {Channel} channel - amqp channel used for publishing.
    * @param {ExchangeConfig} exchangeConfig - Exchange configuration
    * @param {QueueConfig} replyQueueConfig - Queue configuration for replyTo Queue.
    * @param {string} routingKey - Routing key used for message delivery.
    * @param {Object} payload - Message content in JSON format.
    * @returns {Promise<Message>} - Response message of rpc request
    */
    async publishRpcMessage(
        channel: Channel,
        exchangeConfig: ExchangeConfig,
        replyQueueConfig: QueueConfig,
        routingKey: string,
        payload: any
    ): Promise<Message> {
        try {
            const correlationId = uuidv4();

            // Declare a reply queue based on the provided definition
            const { queue: replyQueue } = await this.assertQueue(channel, replyQueueConfig);

            const consumerTag = uuidv4();

            // Ensure the target exchange exists
            await channel.assertExchange(exchangeConfig.name, exchangeConfig.type, exchangeConfig.options);

            return new Promise((resolve, reject) => {
                // listen for a message with the matching correlationId
                channel.consume(replyQueue, (msg) => {
                    if (msg && msg.properties.correlationId === correlationId) {
                        resolve(msg);
                        // Stop consuming once response is recieved
                        channel.cancel(consumerTag);
                    }
                }, {
                    noAck: false,
                    consumerTag,
                });

                // Publishing message to exchange with RPC properties
                this.publishToExchange(channel, exchangeConfig, routingKey, payload, {
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
            this.emit('error', err as Error);
            throw err;
        }
    }

    /**
    * Subscribes to messages from a specific exchange using the RPC pattern, and sends a response.
    * The onDispatch callback routes messages to appropriate handlers based on routingKey.
    *
    * @async
    * @param {Channel} channel - The amqp channel used to set up the subscription.
    * @param {ExchangeConfig} exchangeDefinition - ExchangeDefinition configuration.
    * @param {QueueConfig} queueDefinition - QueueDefinition configuration.
    * @param {string} bindingKey - The bindingKey used for binding queue of Queuedefinition to exchange.
    * @param {function} onDispatch - dispatch function that routes messages by routingKey to registered handlers.
    * @returns {Promise<void>}
    */
    async subscribeRpcMessage(
        channel: Channel,
        exchangeConfig: ExchangeConfig,
        queueConfig: QueueConfig,
        bindingKey: string,
        onDispatch: Handler
    ): Promise<void> {

        try {
            // Ensure the target exchange exists before binding
            await channel.assertExchange(exchangeConfig.name, exchangeConfig.type, exchangeConfig.options);

            // Declare queue the worker will be using
            // This queue will be binded to exchange above
            const { queue: declaredQueue } = await this.assertQueue(channel, queueConfig);

            // Bind the declared queue to the exchange with the specified binding key
            await channel.bindQueue(declaredQueue, exchangeConfig.name, bindingKey);

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
                    this.emit('error', err as Error);
                }
            },
                {
                    noAck: false
                });
        } catch (err) {
            this.emit('error', err as Error);
            throw err;
        }
    }

    /**
    * Publishes a message to a specific exchange using the given exchangeDefinition config.
    * This function is called internally in publishRpcMessage
    * 
    * @async
    * @param {Channel} channel - amqp channel used for publishing.
    * @param {ExchangeConfig} exchangeConfig - Exchange configuration (name, type, durable).
    * @param {string} routingKey - Routing key used for message delivery.
    * @param {Object} payload - Message content in JSON format.
    * @param {Object} [properties={}] - Optional message properties (e.g. for RPC: replyTo, correlationId).
    */
    async publishToExchange(
        channel: Channel,
        exchangeConfig: ExchangeConfig,
        routingKey: string,
        payload: any,
        messageProperties: MessageProperties = {}
    ): Promise<void> {
        try {
            await channel.assertExchange(exchangeConfig.name, exchangeConfig.type, exchangeConfig.options);
            channel.publish(exchangeConfig.name, routingKey, Buffer.from(JSON.stringify(payload)), messageProperties);
        } catch (err) {
            this.emit('error', err as Error);
            throw err;
        }
    }

    /**
    * Subscribes to a specific exchange and binds an exclusive, anonymous queue to the given routing key.
    * Messages matching the routing key will trigger the provided callback.
    *
    * @async
    * @param {Channel} channel - The amqp channel used for exchange and queue operations.
    * @param {ExchangeConfig} exchangeConfig - Exchange configuration
    * @param {QueueConfig} queueConfig - QueueDefinition configuration
    * @param {string} bindingKey - Binding key used for binding anonymous_q to exchange.
    * @param {function} onDispatch - dispatch function that routes messages by routingKey to registered handlers.
    */
    async subscribeToExchange(
        channel: Channel,
        exchangeConfig: ExchangeConfig,
        queueConfig: QueueConfig,
        bindingKey: string,
        onDispatch: Handler
    ): Promise<void> {
        try {
            await channel.assertExchange(exchangeConfig.name, exchangeConfig.type, exchangeConfig.options);

            const { queue: declaredQueue } = await this.assertQueue(channel, queueConfig);

            await channel.bindQueue(declaredQueue, exchangeConfig.name, bindingKey);

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
                        this.emit('error', err as Error);
                    }
                } else {
                    // If invalid msg type, reject and send it to dlx
                    console.warn("Invalid message format received:", msg);
                    if (msg) {
                        channel.reject(msg, false);
                    }
                }
            }, {
                noAck: false,
            });
        } catch (err) {
            this.emit('error', err as Error);
            throw err;
        }
    }

    // graceful shutdown by waiting to release current connection
    async shutdown(): Promise<void> {
        console.info('[MESSAGE-BROKER] Connection closing...');
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }
        this.emit('close');
    }
} 