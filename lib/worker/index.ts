import { EventEmitter } from 'events';
import { Channel, Message } from 'amqplib';
import { ExchangeConfig, QueueConfig, WorkerConfig, Handler } from '../types';

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
export class Worker extends EventEmitter {

    // Internal map that stores handler functions associated with each routing key.
    protected handlerMap: Map<string, Handler>;

    protected channel: Channel;
    protected name: string;
    protected exchangeConfig: ExchangeConfig;
    protected queueConfig: QueueConfig;
    protected bindingKey: string;

    /**
     * Constructor for new Worker instance 
     * 
     * @param {Channel} channel - amqp channel used by the worker when sending/recieving messages
     * @param {WorkerConfig} config - configuration object of worker
     */
    constructor(channel: Channel, config: WorkerConfig) {

        if (!channel) {
            throw new Error("Channel for worker is missing");
        }
        if (!config) {
            throw new Error("WorkerConfig is missing");
        }

        super();
        this.channel = channel;
        this.handlerMap = new Map();

        this.name = config.name;
        this.exchangeConfig = config.exchangeConfig;
        this.queueConfig = config.queueConfig;
        this.bindingKey = config.bindingKey;

        this.on('notfound', (routingKey: string) => {
            console.warn('[MessageDispatcher] Cannot find handler matched with', routingKey);
        });

        this.on('error', (err: Error) => {
            console.error('[MessageDispatcher] Error when dispatching... :', err);
        });

        console.info("[%s] Waiting for routingKey %s messages", this.name, this.bindingKey);
    }

    protected startHeartbeatLog(): void {
        console.debug("%s start", this.name);

        setInterval(() => {
            console.debug("%s is running", this.name);
        }, 5000);
    }

    /**
     * Registers a handler callback function for a specific routingKey.
     * When a message arrives that matches the routingKey, the corresponding registered handler will be invoked to process the message.
     * 
     * @param {string} routingKey - The routingKey to associate with the callback.
     * @param {Handler} callback - A function that will handle the message when the routingKey matches
     */
    registerHandler(routingKey: string, callback: Handler): void {
        if (this.handlerMap) {
            this.handlerMap.set(routingKey, callback);
        }
    }

    /**
     * Registers a complete handleMap object to worker
     * 
     * @param {Map<string, Handler>} handlerMap - A 'Map' datastructure instance where keys are routingKeys and values are async handler functions (channel, msg) => Promise.
     */
    registerHandlerMap(handlerMap: Map<string, Handler>): void {
        this.handlerMap = handlerMap;
    }

    /**
     * Dispatches an incoming message to the appropriate handler based on message's routingKey.
     * 
     * 1. Error Handling of channel and msg parameters are all handled inside MessageBroker which uses dispatch method
     * 2. Acknowledgment signal (channel.ack) must be handled exclusively inside the handler method.
     * 
     * This design enables each worker to process multiple message types dynamically, depending on the routingKey.
     * 
     * @async
     * @param {Channel} channel - amqp channel used by the worker
     * @param {Message} msg - Pure amqp message produced by producer
     * @returns {Promise<any>} - The result returned by the handler after processing the message. Since the handler is user-defined, the return type is intentionally flexible.
     */
    async dispatch(channel: Channel, msg: Message): Promise<any> {

        const routingKey = msg.fields.routingKey;

        if (!this.handlerMap.has(routingKey)) {
            this.emit('notfound', routingKey);
            return;
        }

        const handler = this.handlerMap.get(routingKey);

        try {
            if (handler) {
                const result = await handler(channel, msg);
                return result;
            }
        } catch (err) {
            this.emit('error', err as Error);
        }
    }

    /**
     * Gracefully shuts down the worker by closing its AMQP channel.
     * Ensures the worker to releases its channel-connection to the message broker
     * @async
     */
    async shutdown(): Promise<void> {
        if (this.channel) {
            try {
                await this.channel.close();
                console.debug("[%s] Channel for %s closed", this.name, this.bindingKey);
            } catch (err) {
                console.error("[%s] Error closing channel for %s:", this.name, this.bindingKey, err);
            } 
        }
    }
} 