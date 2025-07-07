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
    // Additional exchange settings such as durable, autoDelete, etc
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
    // Additional queue options such as durability, exclusivity and advance queue features like dead-lettering and messageTTL via arguments.
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
    exchangeConfig: ExchangeConfig; // Exchange configuration worker listens to
    queueConfig: QueueConfig; // Queue configuration this worker consumes from. If left blank, anonymous queue is used automatically.
    bindingKey: string; // Routing Key used for binding queue to exchange (The routing key pattern used for message filtering)
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