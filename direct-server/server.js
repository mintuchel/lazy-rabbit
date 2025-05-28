import { getConnection, subscribeMessage } from "../rabbitmq/index.js";

export class DirectServer {
    constructor(exchangeDefinition, bindingKey) {
        this.exchange = exchangeDefinition;
        this.bindingKey = bindingKey;
        this.connection = null;
        this.channel = null;
    }

    async init() {
        this.connection = await getConnection();
        this.channel = await this.connection.createChannel();
        console.log("[DirectServer] Waiting for routingKey %s messages", this.bindingKey);
    }

    async run() {
        if (!this.channel) {
            await this.init();
        }

        subscribeMessage(this.channel, this.exchange, this.bindingKey);
    }
}