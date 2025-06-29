const messageBroker = require("../lib/message-broker");
const Worker = require("../../lib/worker");
const system = require("../system");

class SlackWorker extends Worker {
    constructor(channel, config) {
        super(channel, config);
    }

    onDispatch(channel, msg) {
        const payload = JSON.parse(msg.content.toString());
        system.info("[RECIEVED] Worker (Slack): ", payload);

        // 0.5 이하이면 바로 DLX로 보내기
        const random = Math.random();
        if (random < 0.5) {
            system.error("[ERROR] Slack Worker : throwing random error");
            throw new Error("Random error occurred in Slack Worker");
        }

        // 정상 처리
        system.info("[PROCESSED] Slack Worker : successfully processed");
        channel.ack(msg);
    }

    async run() {
        this.startHeartbeatLog();

        messageBroker.subscribeToExchange(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.onDispatch);
    }
}

module.exports = SlackWorker;