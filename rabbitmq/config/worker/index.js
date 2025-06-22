const ExchangeDefinitions = require("../exchange");
const QueueDefinitions = require("../queue");

const WorkerDefinitions = {
    AUTH_SERVICE: {
        name: 'AUTH_SERVICE',
        exchangeDefinition: ExchangeDefinitions.AUTH_EXCHANGE,
        queueDefinition: QueueDefinitions.AUTH_REQUEST_QUEUE,
        bindingKey: 'auth.#'
    },
    SMS_WORKER: {
        name: 'SMS_NOTIFICATION_WORKER',
        exchangeDefinition: ExchangeDefinitions.NOTIFICATION_EXCHANGE,
        queueDefinition: QueueDefinitions.NOTIFICATION_SMS_QUEUE,
        bindingKey: 'notification.sms.#'
    },
    EMAIL_WORKER: {
        name: 'EMAIL_NOTIFICATION_WORKER',
        exchangeDefinition: ExchangeDefinitions.NOTIFICATION_EXCHANGE,
        queueDefinition: QueueDefinitions.NOTIFICATION_EMAIL_QUEUE,
        bindingKey: 'notification.email.#'
    },
    SLACK_WORKER: {
        name: 'SLACK_NOTIFICATION_WORKER',
        exchangeDefinition: ExchangeDefinitions.NOTIFICATION_EXCHANGE,
        queueDefinition: QueueDefinitions.NOTIFICATION_SLACK_QUEUE,
        bindingKey: 'notification.slack.#'
    },
    DEAD_LETTER_WORKER: {
        name: 'DEAD_LETTER_WORKER',
        exchangeDefinition: ExchangeDefinitions.NOTIFICATION_DLX,
        queueDefinition: QueueDefinitions.NOTIFICATION_DLQ,
        bindingKey: 'notification.#.dlq'
    }
};

module.exports = WorkerDefinitions;