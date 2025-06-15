const { messageBroker } = require("..");
const system = require("../../system");
const { EventEmitter } = require('events');
const MessageDispatcher = require("./dispatcher");

class Worker extends EventEmitter {
    constructor(config) {
        super();
        this.channel = null;
        this.name = config.name;
        this.exchangeDefinition = config.exchangeDefinition;
        this.queueDefinition = config.queueDefinition;
        this.bindingKey = config.bindingKey;
        this.messageDispatcher = new MessageDispatcher();
    }

    async init() {
        this.channel = await messageBroker.createChannel();
        system.info("[%s] Waiting for routingKey %s messages", this.name, this.bindingKey);
    }

    registerHandler(routingKey, callback) {
        this.messageDispatcher.registerHandler(routingKey, callback);
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

module.exports = { Worker };