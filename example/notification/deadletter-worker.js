const messageBroker = require("../lib/message-broker");
const system = require("../system");
const Worker = require("../../lib/worker");

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