import { ExchangeDefinitions } from "../exchange";
import { QueueDefinitions } from "../queue";
import * as BindingKeys from './binding';
import { WorkerConfig } from "../../../../lib/types/index";

const WorkerDefinitions: Record<string, WorkerConfig> = {
    AUTH_SERVICE: {
        name: 'AUTH_SERVICE',
        exchangeConfig: ExchangeDefinitions.AUTH_EXCHANGE,
        queueConfig: QueueDefinitions.AUTH_REQUEST_QUEUE,
        bindingKey: BindingKeys.AUTH_SERVICE_BK
    },
    SMS_WORKER: {
        name: 'SMS_NOTIFICATION_WORKER',
        exchangeConfig: ExchangeDefinitions.NOTIFICATION_EXCHANGE,
        queueConfig: QueueDefinitions.NOTIFICATION_SMS_QUEUE,
        bindingKey: BindingKeys.SMS_WORKER_BK
    },
    EMAIL_WORKER: {
        name: 'EMAIL_NOTIFICATION_WORKER',
        exchangeConfig: ExchangeDefinitions.NOTIFICATION_EXCHANGE,
        queueConfig: QueueDefinitions.NOTIFICATION_EMAIL_QUEUE,
        bindingKey: BindingKeys.EMAIL_WORKER_BK
    },
    SLACK_WORKER: {
        name: 'SLACK_NOTIFICATION_WORKER',
        exchangeConfig: ExchangeDefinitions.NOTIFICATION_EXCHANGE,
        queueConfig: QueueDefinitions.NOTIFICATION_SLACK_QUEUE,
        bindingKey: BindingKeys.SLACK_WORKER_BK
    },
    DEAD_LETTER_WORKER: {
        name: 'DEAD_LETTER_WORKER',
        exchangeConfig: ExchangeDefinitions.NOTIFICATION_DLX,
        queueConfig: QueueDefinitions.NOTIFICATION_DLQ,
        bindingKey: BindingKeys.DEAD_LETTER_WORKER_BK
    }
};

export { WorkerDefinitions }; 