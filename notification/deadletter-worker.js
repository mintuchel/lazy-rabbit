const messageBroker = require("../rabbitmq");
const { env } = require('../config');
const system = require("../system");
const WorkerDefinitions = require("../rabbitmq/config/worker");
const Worker = require("../rabbitmq/worker");

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

        messageBroker.subscribeToExchange(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.onDispatch);

        system.debug("DeadLetterWorker start");
        setInterval(() => {
            system.debug("DeadLetterWorker is running");
        }, env.HEARTBEAT_INTERVAL_MS);
    }
}

module.exports = DeadLetterWorker;