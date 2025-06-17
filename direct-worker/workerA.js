const messageBroker = require("../rabbitmq");
const { env } = require('../config');
const system = require("../system");
const WorkerDefinitions = require("../rabbitmq/config/worker");
const Worker = require("../rabbitmq/worker");

class WorkerA extends Worker {
    constructor() {
        super(WorkerDefinitions.WORKER_A);
    }

    onSubscribe(msg) {
        system.info("[RECIEVED] WorkerA:", msg.content.toString());
    }

    async run() {
        if (!this.channel) {
            await this.init();
        }

        messageBroker.subscribeToExchange(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.onSubscribe);

        system.debug("WorkerA start");
        setInterval(() => {
            system.debug("WorkerA is running");
        }, env.HEARTBEAT_INTERVAL_MS);
    }
}

module.exports = WorkerA;