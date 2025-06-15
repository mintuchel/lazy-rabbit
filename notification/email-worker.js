const { messageBroker } = require("../rabbitmq");
const { env } = require('../config');
const system = require("../system");
const { Worker } = require("../rabbitmq/worker");
const { WorkerDefinitions } = require("../rabbitmq/config/worker");

class EmailWorker extends Worker {
    constructor() {
        super(WorkerDefinitions.EMAIL_WORKER);
    }

    onSubscribe(msg) {
        system.info("[RECIEVED] Worker (Email):", msg.content.toString());
    }

    async run() {
        if (!this.channel) {
            await this.init();
        }

        messageBroker.subscribeToExchange(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.onSubscribe);

        system.debug("NotificationWorker(Email) start");
        setInterval(() => {
            system.debug("NotificationWorker(Email) is running");
        }, env.HEARTBEAT_INTERVAL_MS);
    }
}

module.exports = { EmailWorker };