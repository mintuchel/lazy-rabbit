const { messageBroker } = require("../rabbitmq");
const { env } = require('../config');
const system = require("../system");

// topic-exchange
class NotificationServer {
    constructor(exchangeDefinition, bindingKey, onSubscribe) {
        this.channel = null;
        this.exchange = exchangeDefinition;
        this.bindingKey = bindingKey;
        this.onSubscribe = onSubscribe;
    }

    async init() {
        this.channel = await messageBroker.createChannel();
        system.info("[NotificationServer] Waiting for routingKey %s messages", this.bindingKey);
    }

    async run() {
        if (!this.channel) {
            await this.init();
        }

        messageBroker.subscribeToExchange(this.channel, this.exchange, this.bindingKey, this.onSubscribe);

        system.debug("NotificationServer start");
        setInterval(() => {
            system.debug("NotificationServer is running");
        }, env.HEARTBEAT_INTERVAL_MS);
    }

    async shutdown() {
        if (this.channel) {
            try {
                await this.channel.close();
                this.channel = null;
                system.debug(`[NotificationServer] Channel for ${this.bindingKey} closed`);
            } catch (err) {
                system.error(`[NotificationServer] Error closing channel for ${this.bindingKey}:`, err);
            }
        }
    }
}

module.exports = { NotificationServer };