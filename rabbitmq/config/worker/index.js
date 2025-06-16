const { ExchangeDefinitions } = require("../exchange");
const { QueueDefinitions } = require("../queue");

const WorkerDefinitions = {
    LOGGER: {
        name: 'Logger',
        exchangeDefinition: ExchangeDefinitions.LOGGER_EXCHANGE,
        queueDefinition: '',
        bindingKey: 'logger.#'
    },
    WORKER_A: {
        name: 'Worker A',
        exchangeDefinition: ExchangeDefinitions.DIRECT_EXCHANGE,
        queueDefinition: '',
        bindingKey: 'A'
    },
    WORKER_B: {
        name: 'Worker B',
        exchangeDefinition: ExchangeDefinitions.DIRECT_EXCHANGE,
        queueDefinition: '',
        bindingKey: 'B'
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
    },

};

module.exports = { WorkerDefinitions };