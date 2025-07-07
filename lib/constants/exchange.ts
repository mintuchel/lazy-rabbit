export const ExchangeType = {
    FANOUT: 'fanout',
    DIRECT: 'direct',
    TOPIC: 'topic',
    HEADERS: 'headers',
} as const;
  
export type ExchangeType = typeof ExchangeType[keyof typeof ExchangeType];