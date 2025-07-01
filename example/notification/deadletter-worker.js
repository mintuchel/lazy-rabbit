const { Worker } = require("../../lib");
const messageBroker = require("../lib/message-broker");
const system = require("../system");

class DeadLetterWorker extends Worker {
    constructor(channel, config) {
        super(channel, config);
    }

    onDispatch(channel, msg) {
        const payload = JSON.parse(msg.content.toString());
        const routingKey = msg.fields.routingKey;
        system.error("[RECIEVED] DEAD-LETTER-WORKER: ", payload, "routingKey:", routingKey);
    }

    async run() {
        this.startHeartbeatLog();

        messageBroker.subscribeToExchange(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.onDispatch);
    }
}

module.exports = DeadLetterWorker;