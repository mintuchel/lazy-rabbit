const { messageBroker } = require("../rabbitmq");
const { env } = require('../config');
const system = require("../system");
const { WorkerDefinitions } = require("../rabbitmq/config/worker");
const { Worker } = require("../rabbitmq/worker");

class WorkerB extends Worker{
    constructor() {
        super(WorkerDefinitions.WORKER_B);
    }

    onSubscribe(msg) {
        system.info("[RECIEVED] WorkerB:", msg.content.toString());
    }

    async run() {
        if (!this.channel) {
            await this.init();
        }

        messageBroker.subscribeToExchange(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.onSubscribe);
    
        system.debug("WorkerB start");
        setInterval(() => {
            system.debug("WorkerB is running");
        }, env.HEARTBEAT_INTERVAL_MS);
    }
}

module.exports = { WorkerB };