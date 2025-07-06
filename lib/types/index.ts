import * as amqp from 'amqplib';

export interface MessageBrokerConfig {
    MSG_QUEUE_URL: string;
    HEARTBEAT_INTERVAL_MS?: number;
}

export interface ExchangeConfig {
    name: string;
    type: string;
    options?: {
        durable?: boolean;
        autoDelete?: boolean;
        internal?: boolean;
    };
}

export interface QueueConfig {
    name: string;
    options?: {
        durable?: boolean;
        exclusive?: boolean;
        autoDelete?: boolean;
        arguments?: any;
    };
}

export interface WorkerConfig {
    name: string;
    exchangeConfig: ExchangeConfig;
    queueConfig: QueueConfig;
    bindingKey: string;
}

export interface MessageProperties {
    correlationId?: string;
    replyTo?: string;
    [key: string]: any;
}

export type DispatchFunction = (channel: amqp.Channel, msg: amqp.Message) => void;