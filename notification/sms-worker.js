const { messageBroker } = require("../rabbitmq");
const { env } = require('../config');
const system = require("../system");
const { Worker } = require("../rabbitmq/worker");
const { WorkerDefinitions } = require("../rabbitmq/config/worker");

class SMSWorker extends Worker {
    constructor() {
        super(WorkerDefinitions.SMS_WORKER);
    }

    onSubscribe(msg) {
        system.info("[RECIEVED] Worker (SMS): ", msg.content.toString());
    }

    async run() {
        if (!this.channel) {
            await this.init();
        }

        messageBroker.subscribeToExchange(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.onSubscribe);

        system.debug("NotificationWorker(SMS) start");
        setInterval(() => {
            system.debug("NotificationWorker(SMS) is running");
        }, env.HEARTBEAT_INTERVAL_MS);
    }
}

module.exports = { SMSWorker };