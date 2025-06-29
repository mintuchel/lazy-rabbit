const messageBroker = require("../lib/message-broker");
const Worker = require("../../lib/worker");
const system = require("../system");

class EmailWorker extends Worker {
    constructor(channel, config) {
        super(channel, config);
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
        this.startHeartbeatLog();

        messageBroker.subscribeToExchange(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.onDispatch);
    }
}

module.exports = EmailWorker;