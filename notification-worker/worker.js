const { messageBroker } = require("../rabbitmq");
const { env } = require('../config');
const system = require("../system");

// topic-exchange
class NotificationWorker {
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
            system.debug("NotificationWorker is running");
        }, env.HEARTBEAT_INTERVAL_MS);
    }

    async shutdown() {
        if (this.channel) {
            try {
                await this.channel.close();
                this.channel = null;
                system.debug(`[NotificationWorker] Channel for ${this.bindingKey} closed`);
            } catch (err) {
                system.error(`[NotificationWorker] Error closing channel for ${this.bindingKey}:`, err);
            }
        }
    }
}

module.exports = { NotificationWorker };