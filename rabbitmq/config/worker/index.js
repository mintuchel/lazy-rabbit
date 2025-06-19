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
        queueDefinition: QueueDefinitions.NOTIFY_SMS_QUEUE,
        bindingKey: 'notify.sms.#'
    },
    EMAIL_WORKER: {
        name: 'email-notification',
        exchangeDefinition: ExchangeDefinitions.NOTIFICATION_EXCHANGE,
        queueDefinition: QueueDefinitions.NOTIFY_EMAIL_QUEUE,
        bindingKey: 'notify.email.#'
    },
    SLACK_WORKER: {
        name: 'slack-notification',
        exchangeDefinition: ExchangeDefinitions.NOTIFICATION_EXCHANGE,
        queueDefinition: QueueDefinitions.NOTIFY_SLACK_QUEUE,
        bindingKey: 'notify.slack.#'
    }
};

module.exports = WorkerDefinitions;