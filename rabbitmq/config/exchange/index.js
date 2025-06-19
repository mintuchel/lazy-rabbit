const ExchangeType = require("./types");

const ExchangeDefinitions = {
    AUTH_EXCHANGE: {
        name: 'auth.exchange',
        type: ExchangeType.TOPIC,
        options: {
            durable: false,
            autoDelete: true,
            internal: false
        }
    },
    NOTIFICATION_EXCHANGE: {
        name: 'notification.exchange',
        type: ExchangeType.TOPIC,
        options: {
            durable: false,
            autoDelete: true,
            internal: false
        }
    }
};

module.exports = ExchangeDefinitions;