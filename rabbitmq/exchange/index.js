const { ExchangeType } = require("./types");

const ExchangeDefinitions = {
    FANOUT_EXCHANGE: {
        name: 'avocado.fanout.exchange',
        type: ExchangeType.FANOUT,
        durable: false,
    },
    DIRECT_EXCHANGE: {
        name: 'avocado.direct.exchange',
        type: ExchangeType.DIRECT,
        durable: false,
    },
    NOTIFICATION_EXCHANGE: {
        name: 'avocado.notification.exchange',
        type: ExchangeType.TOPIC,
        durable: false,
    },
    RPC_EXCHANGE: {
        name: 'avocado.rpc.exchange',
        type: ExchangeType.DIRECT,
        durable: false,
    }
};

module.exports = { ExchangeDefinitions };