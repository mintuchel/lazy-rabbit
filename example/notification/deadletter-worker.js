const messageBroker = require("../../src");
const { env } = require('../config');
const system = require("../system");
const Worker = require("../../src/worker");
const WorkerDefinitions = require("../config/rabbitmq/worker");

class DeadLetterWorker extends Worker {
    constructor() {
        super(WorkerDefinitions.DEAD_LETTER_WORKER);
    }

    onDispatch(channel, msg) {
        const payload = JSON.parse(msg.content.toString());
        const routingKey = msg.fields.routingKey;
        system.error("[RECIEVED] DEAD-LETTER-WORKER: ", payload, "routingKey:", routingKey);
    }

    async run() {
        if (!this.channel) {
            await this.init();
        }

        this.startHeartbeatLog();

        messageBroker.subscribeToExchange(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.onDispatch);
    }
}

module.exports = DeadLetterWorker;