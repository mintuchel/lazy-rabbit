const { messageBroker } = require("../rabbitmq");
const { env } = require('../config');
const system = require("../system");
const { WorkerDefinitions } = require("../rabbitmq/config/worker");
const { Worker } = require("../rabbitmq/worker");

class SlackWorker extends Worker{
    constructor() {
        super(WorkerDefinitions.SLACK_WORKER);
    }

    onSubscribe(msg) {
        system.info("[RECIEVED] Worker (Slack): ", msg.content.toString());
    }
    
    async run() {
        if (!this.channel) {
            await this.init();
        }

        messageBroker.subscribeToExchange(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.onSubscribe);

        system.debug("NotificationWorker(Slack) start");
        setInterval(() => {
            system.debug("NotificationWorker(Slack) is running");
        }, env.HEARTBEAT_INTERVAL_MS);
    }
}

module.exports = { SlackWorker };