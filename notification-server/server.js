import { createChannel, subscribeMessage } from "../rabbitmq/index.js";

export class NotificationServer {
    constructor(exchangeDefinition, bindingKey, onSubscribe) {
        this.channel = null;
        this.exchange = exchangeDefinition;
        this.bindingKey = bindingKey;
        this.onSubscribe = onSubscribe;
    }

    async init() {
        this.channel = await createChannel();
        console.log("[NotificationServer] Waiting for routingKey %s messages", this.bindingKey);
    }

    async run() {
        if (!this.channel) {
            await this.init();
        }
        subscribeMessage(this.channel, this.exchange, this.bindingKey, this.onSubscribe);
    }
}