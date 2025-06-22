const messageBroker = require("..");
const system = require("../system");
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
        system.debug("%s start", this.name);

        setInterval(() => {
            system.debug("%s is running", this.name);
        }, 5000);
    }

    constructor(config) {
        super();
        this.channel = null;
        this.#handlerMap = new Map();

        this.name = config.name;
        this.exchangeDefinition = config.exchangeDefinition;
        this.queueDefinition = config.queueDefinition;
        this.bindingKey = config.bindingKey;

        this.on('notfound', (routingKey) => {
            system.info('[MessageDispatcher] Cannot find handler matched with', routingKey);
        });

        this.on('error', (err) => {
            system.info('[MessageDispatcher] Error when dispatching... :', err);
        });
    }

    // Initializes the amqp channel
    async init() {
        this.channel = await messageBroker.createChannel();
        system.info("[%s] Waiting for routingKey %s messages", this.name, this.bindingKey);
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

    // 다른 파일에 handlerMap 을 정의하고 함수로 바로 세팅가능
    /**
     * 
     * @param {*} handlerMap - handlerMap that is defined in other file
     */
    registerHandlerMap(handlerMap) {
        this.#handlerMap = handlerMap;
    }

    /**
     * Dispatches an incoming message to the appropriate handler based on message's routingKey.
     * 
     * This allows each worker to handle multiple messages dynamically depending on the routingKey.
     * @async
     * @param channel - amqp channel used by the worker
     * @param {amqplib.Message} msg - Pure amqp message produced by producer
     */
    async dispatch(channel, msg) {
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

    async shutdown() {
        if (this.channel) {
            try {
                await this.channel.close();
                this.channel = null;
                system.debug("[%s] Channel for %s closed", this.name, this.bindingKey);
            } catch (err) {
                system.error("[%s] Error closing channel for %s:", this.name, this.bindingKey);
            }
        }
    }
}

module.exports = Worker;