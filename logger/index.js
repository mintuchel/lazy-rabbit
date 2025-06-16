const { messageBroker } = require("../rabbitmq");
const { env } = require('../config');
const { WorkerDefinitions } = require("../rabbitmq/config/worker");
const { Worker } = require("../rabbitmq/worker");
const system = require("../system");

class Logger extends Worker {
    constructor() {
        super(WorkerDefinitions.LOGGER);
    }

    async init() {
        
    }

    async run() {
        if (!this.channel) {
            await this.init();
        }

        messageBroker.subscribeToExchange(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.onSubscribe);
    
        system.debug("Logger start");
        setInterval(() => {
            system.debug("Logger is running");
        }, env.HEARTBEAT_INTERVAL_MS);
    }
}

module.exports = Logger;