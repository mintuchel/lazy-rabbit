const { messageBroker } = require("../rabbitmq");
const { env } = require('../config');
const system = require("../system");


class DirectServer {
    constructor(exchangeDefinition, bindingKey, onSubscribe) {
        this.channel = null;
        this.exchange = exchangeDefinition;
        this.bindingKey = bindingKey;
        this.onSubscribe = onSubscribe;
    }

    async init() {
        this.channel = await messageBroker.createChannel();
        system.info("[DirectServer] Waiting for routingKey %s messages", this.bindingKey);
    }

    async run() {
        if (!this.channel) {
            await this.init();
        }

        messageBroker.subscribeToExchange(this.channel, this.exchange, this.bindingKey, this.onSubscribe);
    
        system.debug("DirectServer start");
        setInterval(() => {
            system.debug("DirectServer is running");
        }, env.HEARTBEAT_INTERVAL_MS);
    }

    async shutdown() {
        if (this.channel) {
            try {
                // 메시지 수신 중단 + 리소스 정리
                await this.channel.close();
                this.channel = null;
                system.debug(`[DirectServer] Channel for routingKey ${this.bindingKey} closed`);
            } catch (err) {
                system.error(`[DirectServer] Failed to close channel for ${this.bindingKey}:`, err);
            }
        }
    }
}

module.exports = { DirectServer };