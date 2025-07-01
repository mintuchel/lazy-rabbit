const { Worker } = require("../../lib");
const messageBroker = require("../lib/message-broker");
const system = require("../system");

class SlackWorker extends Worker {
    constructor(channel, config) {
        super(channel, config);
    }

    onDispatch(channel, msg) {
        const payload = JSON.parse(msg.content.toString());
        system.info("[RECIEVED] Worker (Slack): ", payload);

        // custom error generator for testing
        const num = Math.random();
        if (num < 0.5) {
            system.error("[ERROR] Slack Worker : throwing random error");
            throw new Error("Random error occurred in Slack Worker");
        }
        
        system.info("[PROCESSED] Slack Worker : successfully processed");
        channel.ack(msg);
    }

    async run() {
        this.startHeartbeatLog();
        messageBroker.subscribeToExchange(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.onDispatch);
    }
}

module.exports = SlackWorker;