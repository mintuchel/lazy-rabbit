import { Channel, Message } from 'amqplib';
import { ExchangeType } from '../constants/exchange';

export interface MessageBrokerConfig {
    MSG_QUEUE_URL: string;
    HEARTBEAT_INTERVAL_MS?: number;
}

/**
 * Configuration for AMQP exchange
 */
export interface ExchangeConfig {
    name: string; // The name of the exchange
    type: ExchangeType; // The type of the exchange
    // Optional settings for exchange
    options?: {
        durable?: boolean;
        autoDelete?: boolean;
        internal?: boolean;
    };
}

/**
 * Configuration for AMQP queue
 */
export interface QueueConfig {
    name: string; // The name of the queue
    // Optional settings for queue
    options?: {
        durable?: boolean;
        exclusive?: boolean;
        autoDelete?: boolean;
        arguments?: any;
    };
}

/**
 * Configuration for worker that binds a queue to certain exchange
 */
export interface WorkerConfig {
    name: string; // Name of the worker
    exchangeConfig: ExchangeConfig; // Exchange configuration used by the worker
    queueConfig: QueueConfig; // Queue configuration used by the worker
    bindingKey: string; // Routing Key used for binding queue to exchange
}

/**
 * Standard AMQP message properties
 */
export interface MessageProperties {
    correlationId?: string;
    replyTo?: string;
    [key: string]: any;
}

/**
 * Handler function that processes incoming AMQP messages
 * 
 * @param {Channel} channel - The channel through which the message was recieved.
 * This channel is provided to allow the handler to invoke other `MessageBroker` methods(`publishToExchange`, `subscribeToExchange` etc) enabling a continuous message flow within the system.
 * @param {Message} msg - The recieved AMQP message
 * @returns {Promise<any>} - The result returned by the handler after processing the message. Since the handler is user-defined, the return type is intentionally flexible.  
 */
export type Handler = (channel: Channel, msg: Message) => Promise<any>;