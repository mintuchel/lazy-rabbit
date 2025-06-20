const messageBroker = require("../rabbitmq");
const { env } = require('../config');
const system = require("../system");
const WorkerDefinitions = require("../rabbitmq/config/worker");
const Worker = require("../rabbitmq/worker");

class SlackWorker extends Worker {
    constructor() {
        super(WorkerDefinitions.SLACK_WORKER);
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
        if (!this.channel) {
            await this.init();
        }

        messageBroker.subscribeToExchange(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.onDispatch);

        system.debug("NotificationWorker(Slack) start");
        setInterval(() => {
            system.debug("NotificationWorker(Slack) is running");
        }, env.HEARTBEAT_INTERVAL_MS);
    }
}

module.exports = SlackWorker;