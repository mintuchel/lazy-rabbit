const ExchangeDefinitions = require("../exchange");
const QueueDefinitions = require("../queue");
const bindingKeys = require('./binding');

const WorkerDefinitions = {
    AUTH_SERVICE: {
        name: 'AUTH_SERVICE',
        exchangeDefinition: ExchangeDefinitions.AUTH_EXCHANGE,
        queueDefinition: QueueDefinitions.AUTH_REQUEST_QUEUE,
        bindingKey: bindingKeys.AUTH_SERVICE_BK
    },
    SMS_WORKER: {
        name: 'SMS_NOTIFICATION_WORKER',
        exchangeDefinition: ExchangeDefinitions.NOTIFICATION_EXCHANGE,
        queueDefinition: QueueDefinitions.NOTIFICATION_SMS_QUEUE,
        bindingKey: bindingKeys.SMS_WORKER_BK
    },
    EMAIL_WORKER: {
        name: 'EMAIL_NOTIFICATION_WORKER',
        exchangeDefinition: ExchangeDefinitions.NOTIFICATION_EXCHANGE,
        queueDefinition: QueueDefinitions.NOTIFICATION_EMAIL_QUEUE,
        bindingKey: bindingKeys.EMAIL_WORKER_BK
    },
    SLACK_WORKER: {
        name: 'SLACK_NOTIFICATION_WORKER',
        exchangeDefinition: ExchangeDefinitions.NOTIFICATION_EXCHANGE,
        queueDefinition: QueueDefinitions.NOTIFICATION_SLACK_QUEUE,
        bindingKey: bindingKeys.SLACK_WORKER_BK
    },
    DEAD_LETTER_WORKER: {
        name: 'DEAD_LETTER_WORKER',
        exchangeDefinition: ExchangeDefinitions.NOTIFICATION_DLX,
        queueDefinition: QueueDefinitions.NOTIFICATION_DLQ,
        bindingKey: bindingKeys.DEAD_LETTER_WORKER_BK
    }
};

module.exports = WorkerDefinitions;