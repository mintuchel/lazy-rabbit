const ExchangeDefinitions = require("../exchange");
const QueueDefinitions = require("../queue");

const WorkerDefinitions = {
    AUTH_SERVICE: {
        name: 'AuthService',
        exchangeDefinition: ExchangeDefinitions.AUTH_EXCHANGE,
        queueDefinition: QueueDefinitions.AUTH_REQUEST_QUEUE,
        bindingKey: 'auth.#'
    },
    SMS_WORKER: {
        name: 'sms-notification',
        exchangeDefinition: ExchangeDefinitions.NOTIFICATION_EXCHANGE,
        queueDefinition: QueueDefinitions.NOTIFICATION_SMS_QUEUE,
        bindingKey: 'notification.sms.#'
    },
    EMAIL_WORKER: {
        name: 'email-notification',
        exchangeDefinition: ExchangeDefinitions.NOTIFICATION_EXCHANGE,
        queueDefinition: QueueDefinitions.NOTIFICATION_EMAIL_QUEUE,
        bindingKey: 'notification.email.#'
    },
    SLACK_WORKER: {
        name: 'slack-notification',
        exchangeDefinition: ExchangeDefinitions.NOTIFICATION_EXCHANGE,
        queueDefinition: QueueDefinitions.NOTIFICATION_SLACK_QUEUE,
        bindingKey: 'notification.slack.#'
    },
    DEAD_LETTER_WORKER: {
        name: 'dead-letter-worker',
        exchangeDefinition: ExchangeDefinitions.NOTIFICATION_DLX,
        queueDefinition: QueueDefinitions.NOTIFICATION_DLQ,
        bindingKey: 'notification.#.dlq'
    }
};

module.exports = WorkerDefinitions;