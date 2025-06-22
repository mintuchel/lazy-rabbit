const messageBroker = require("../../lib");
const Worker = require("../../lib/worker");
const system = require("../system");
const WorkerDefinitions = require("../config/rabbitmq/worker");

class SMSWorker extends Worker {
    constructor() {
        super(WorkerDefinitions.SMS_WORKER);
    }

    onDispatch(channel, msg) {
        const payload = JSON.parse(msg.content.toString());
        system.info("[RECIEVED] Worker (SMS): ", payload);

        // 0.5 이하이면 바로 DLX로 보내기
        const random = Math.random();
        if (random < 0.5) {
            system.error("[REJECT] Worker(SMS): randomly rejecting message");
            channel.nack(msg, false, false);
            return;
        }

        // 정상 처리
        system.info("[PROCESSED] SMS Worker successfully processed:");
        channel.ack(msg);
    }

    async run() {
        if (!this.channel) {
            await this.init();
        }

        this.startHeartbeatLog();

        messageBroker.subscribeToExchange(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.onDispatch);
    }
}

module.exports = SMSWorker;