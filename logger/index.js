const { messageBroker } = require("../rabbitmq");
const { env } = require('../config');
const { WorkerDefinitions } = require("../rabbitmq/config/worker");
const { Worker } = require("../rabbitmq/worker");
const system = require("../system");
const { onWarn, onError } = require("./handler");

class Logger extends Worker {
    constructor() {
        super(WorkerDefinitions.LOGGER);
        this.registerHandler("logger.warn", onWarn);
        this.registerHandler("logger.error", onError);
    }

    async run() {
        if (!this.channel) {
            await this.init();
        }

        // to use dispatch in callback, we need to bind current "this" to use same context
        messageBroker.subscribeToExchange(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.dispatch.bind(this));
    
        system.debug("Logger start");
        setInterval(() => {
            system.debug("Logger is running");
        }, env.HEARTBEAT_INTERVAL_MS);
    }
}

module.exports = Logger;