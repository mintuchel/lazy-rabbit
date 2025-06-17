const messageBroker = require("..");
const system = require("../../system");
const { EventEmitter } = require('events');

class Worker extends EventEmitter {

    constructor(config) {
        super();
        this.channel = null;
        this.name = config.name;
        this.exchangeDefinition = config.exchangeDefinition;
        this.queueDefinition = config.queueDefinition;
        this.bindingKey = config.bindingKey;
        this.handlerMap = new Map();

        this.on('notfound', (routingKey) => {
            system.info('[MessageDispatcher] Cannot find handler matched with', routingKey);
        });

        this.on('error', (err) => {
            system.info('[MessageDispatcher] Error when dispatching... :', err);
        });
    }

    async init() {
        this.channel = await messageBroker.createChannel();
        system.info("[%s] Waiting for routingKey %s messages", this.name, this.bindingKey);
    }

    registerHandler(routingKey, callback) {
        this.handlerMap.set(routingKey, callback);
    }

    async dispatch(msg) {
        const routingKey = msg.fields.routingKey;
        const payload = JSON.parse(msg.content.toString());

        if (!this.handlerMap.has(routingKey)) {
            this.emit('notfound', routingKey);
        }

        const handler = this.handlerMap.get(routingKey);

        try {
            const result = await handler(payload);
            return result;
        } catch (err) {
            this.emit('error', err);
            throw err; // 이거 안하면 어케 됨? 
        }
    }

    async shutdown() {
        if (this.channel) {
            try {
                await this.channel.close();
                this.channel = null;
                system.debug("[%s] Channel for %s closed", this.name, this.bindingKey);
            } catch (err) {
                system.error("[%s] Error closing channel for %s:", this.name, this.bindingKey);
            }
        }
    }
}

module.exports = Worker;