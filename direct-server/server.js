import { messageBroker } from "../rabbitmq/index.js";

export class DirectServer {
    constructor(exchangeDefinition, bindingKey, onSubscribe) {
        this.channel = null;
        this.exchange = exchangeDefinition;
        this.bindingKey = bindingKey;
        this.onSubscribe = onSubscribe;
    }

    async init() {
        this.channel = await messageBroker.createChannel();
        console.log("[DirectServer] Waiting for routingKey %s messages", this.bindingKey);
    }

    async run() {
        if (!this.channel) {
            await this.init();
        }

        messageBroker.subscribeToExchange(this.channel, this.exchange, this.bindingKey, this.onSubscribe);
    }

    async shutdown() {
        if (this.channel) {
            try {
                // 메시지 수신 중단 + 리소스 정리
                await this.channel.close();
                console.log(`[DirectServer] Channel for routingKey ${this.bindingKey} closed`);
            } catch (err) {
                console.error(`[DirectServer] Failed to close channel for ${this.bindingKey}:`, err);
            }
        }
    }
}