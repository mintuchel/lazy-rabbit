const { ExchangeType } = require("./types");

const ExchangeDefinitions = {
    LOGGER_EXCHANGE: {
        name: 'avocado.logger.exchange',
        type: ExchangeType.TOPIC,
        options: {
            durable: false,
            autoDelete: true,
            internal: false
        }
    },
    DIRECT_EXCHANGE: {
        name: 'avocado.direct.exchange',
        type: ExchangeType.DIRECT,
        options: {
            durable: false,
            autoDelete: true,
            internal: false
        }
    },
    NOTIFICATION_EXCHANGE: {
        name: 'avocado.notification.exchange',
        type: ExchangeType.TOPIC,
        options: {
            durable: false,
            autoDelete: true,
            internal: false
        }
    },
    RPC_EXCHANGE: {
        name: 'avocado.rpc.exchange',
        type: ExchangeType.DIRECT,
        options: {
            durable: false,
            autoDelete: true,
            internal: false
        }
    }
};

module.exports = { ExchangeDefinitions };