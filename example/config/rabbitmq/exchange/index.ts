import { ExchangeType } from "../../../../lib/constants/exchange";
import { ExchangeConfig } from "../../../../lib/types/index";

const ExchangeDefinitions: Record<string, ExchangeConfig> = {
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
    },
    NOTIFICATION_DLX: {
        name: 'dlx.notification.exchange',
        type: ExchangeType.TOPIC,
        options: {
            durable: false,
            autoDelete: true,
            internal: false
        }
    }
};

export { ExchangeDefinitions }; 