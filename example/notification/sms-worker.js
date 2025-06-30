const messageBroker = require("../lib/message-broker");
const Worker = require("../../lib/worker");
const system = require("../system");

class SMSWorker extends Worker {
    constructor(channel, config) {
        super(channel, config);
    }

    onDispatch(channel, msg) {
        const payload = JSON.parse(msg.content.toString());
        system.info("[RECIEVED] Worker (SMS): ", payload);

        // custom error generator for testing
        const num = Math.random();
        if (num < 0.5) {
            system.error("[REJECT] Worker(SMS): randomly rejecting message");
            channel.nack(msg, false, false);
            return;
        }

        system.info("[PROCESSED] SMS Worker successfully processed:");
        channel.ack(msg);
    }

    async run() {
        this.startHeartbeatLog();
        messageBroker.subscribeToExchange(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.onDispatch);
    }
}

module.exports = SMSWorker;