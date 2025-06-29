const { EventEmitter } = require('events');

/**
 * @abstract_like
 * Worker class that listens for messages matching its bindingKey, and dispatches them to the appropriate handler based on the message's routingKey.
 *
 * This class supports dynamic registration of handlers for different routingKeys,
 * making it suitable for multitask or multi-routingKey message processing.
 *
 * Extend this class to implement specialized workers or consumers 
 * for handling specific sets of messages in a modular architecture.
 *
 * Typically used in a microservices or event-driven architecture 
 * where each worker is responsible for handling a subset of tasks.
 */
class Worker extends EventEmitter {

    /**
     * @private
     * Internal map that stores handler functions associated with each routing key.
     */
    #handlerMap = null;

    startHeartbeatLog() {
        console.debug("%s start", this.name);

        setInterval(() => {
            console.debug("%s is running", this.name);
        }, 5000);
    }

    /**
     * Constructor for new Worker instance 
     * 
     * @param {*} channel - amqp channel used by the worker when sending/recieving messages
     * @param {*} config - configuration object of worker
     */
    constructor(channel, config) {

        if (!channel) {
            throw new Error("channel for worker is missing");
        }
        if (!config) {
            throw new Error("config for worker is missing");
        }

        super();
        this.channel = channel;
        this.#handlerMap = new Map();

        this.name = config.name;
        this.exchangeDefinition = config.exchangeDefinition;
        this.queueDefinition = config.queueDefinition;
        this.bindingKey = config.bindingKey;

        this.on('notfound', (routingKey) => {
            console.warn('[MessageDispatcher] Cannot find handler matched with', routingKey);
        });

        this.on('error', (err) => {
            console.error('[MessageDispatcher] Error when dispatching... :', err);
        });

        console.info("[%s] Waiting for routingKey %s messages", this.name, this.bindingKey);
    }

    /**
     * Registers a handler callback function for a specific routingKey.
     * When a message arrives that matches the routingKey, the corresponding registered handler will be invoked to process the message.
     * 
     * @param {string} routingKey - The routingKey to associate with the callback.
     * @param {Function} callback - A function that will handle the message when the routingKey matches
     */
    registerHandler(routingKey, callback) {
        this.#handlerMap.set(routingKey, callback);
    }

    /**
     * Registers a complete handleMap object to worker
     * 
     * @param {Map<string, Function>} handlerMap - - A 'Map' datastructure instance where keys are routingKeys and values are async handler functions (channel, msg) => Promise.
     */
    registerHandlerMap(handlerMap) {
        this.#handlerMap = handlerMap;
    }

    /**
     * Dispatches an incoming message to the appropriate handler based on message's routingKey.
     * 
     * This allows each worker to handle multiple messages dynamically depending on the routingKey.
     * @async
     * @param {amqplib.Channel} channel - amqp channel used by the worker
     * @param {amqplib.Message} msg - Pure amqp message produced by producer
     */
    async dispatch(channel, msg) {
        if (!channel) {
            this.emit('error', new Error('Channel parameter missing when dispatching in %s worker', this.name))
        }

        if (!msg || !msg.fields) {
            this.emit('error', new Error('Invalid message format: missing fields'));
            return;
        }

        const routingKey = msg.fields.routingKey;

        if (!this.#handlerMap.has(routingKey)) {
            this.emit('notfound', routingKey);
        }

        const handler = this.#handlerMap.get(routingKey);

        try {
            const result = await handler(channel, msg);
            return result;
        } catch (err) {
            this.emit('error', err);
            throw err;
        }
    }

    /**
     * Gracefully shuts down the worker by closing its AMQP channel.
     * Ensures the worker to releases its channel-connection to the message broker
     * 
     * @async
     */
    async shutdown() {
        if (this.channel) {
            try {
                await this.channel.close();
                this.channel = null;
                console.debug("[%s] Channel for %s closed", this.name, this.bindingKey);
            } catch (err) {
                console.error("[%s] Error closing channel for %s:", this.name, this.bindingKey);
            }
        }
    }
}

module.exports = Worker;