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

        messageBroker.subscribeMessage(this.channel, this.exchange, this.bindingKey, this.onSubscribe);
    }
}