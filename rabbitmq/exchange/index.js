import { ExchangeType } from "./types.js"

export const ExchangeDefinitions = {
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
};