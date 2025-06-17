const messageBroker = require("../rabbitmq");
const { env } = require('../config');
const system = require("../system");
const Worker = require("../rabbitmq/worker");
const WorkerDefinitions = require("../rabbitmq/config/worker");

class RpcWorker extends Worker {
    constructor() {
        super(WorkerDefinitions.RPC_WORKER);
    }

    // 메시지 받으면 실행할 비즈니스 로직
    async onSubscribe(messagePayload) {
        system.info('[RECIEVED] RpcWorker: ', messagePayload);
        return {
            success: true,
            message: "this is response message by RPC-Worker!"
        };
    }

    async run() {
        if (!this.channel) {
            await this.init();
        }

        messageBroker.subscribeRpcMessage(this.channel, this.exchangeDefinition, "", this.bindingKey, this.onSubscribe);

        system.debug("RpcWorker start");
        setInterval(() => {
            system.debug("RpcWorker is running");
        }, env.HEARTBEAT_INTERVAL_MS);
    }
}

module.exports = RpcWorker;