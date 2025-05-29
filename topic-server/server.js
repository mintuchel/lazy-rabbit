import { createChannel, subscribeMessage } from "../rabbitmq/index.js";

export class TopicServer {
    constructor(exchangeDefinition, bindingKey) {
        this.channel = null;
        this.exchange = exchangeDefinition;
        this.bindingKey = bindingKey;
    }

    async init() {
        this.channel = await createChannel();
        console.log("[TopicServer] Waiting for routingKey %s messages", this.bindingKey);
    }

    async run() {
        if (!this.channel) {
            await this.init();
        }

        subscribeMessage(this.channel, this.exchange, this.bindingKey);
    }
}