const messageBroker = require("../rabbitmq");
const { env } = require('../config');
const system = require("../system");
const WorkerDefinitions = require("../rabbitmq/config/worker");
const Worker = require("../rabbitmq/worker");

class EmailWorker extends Worker {
    constructor() {
        super(WorkerDefinitions.EMAIL_WORKER);
    }

    onDispatch(channel, msg) {
        const payload = JSON.parse(msg.content.toString());
        system.info("[RECIEVED] Worker (Email): ", payload);

        // 0.5 이하이면 ack/nack 하지 않음
        const random = Math.random();
        if (random < 0.5) {
            system.error("[TIMEOUT] Email Worker simulating timeout - no ack/nack:", payload);
            // ack/nack을 하지 않으면 TTL(3초) 후 deadletter로 이동
            return;
        }

        // 정상 처리
        system.info("[PROCESSED] Email Worker successfully processed:", payload);
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

module.exports = EmailWorker;