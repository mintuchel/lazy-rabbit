const { messageBroker } = require("../rabbitmq");
const { env } = require('../config');
const system = require("../system");

class RpcServer {
    constructor(exchangeDefinition, queueDefinition) {
        this.channel = null;
        this.exchangeDefinition = exchangeDefinition;
        this.queueDefinition = queueDefinition;
        this.bindingKey = 'avocado.rpc';
    }

    async init() {
        this.channel = await messageBroker.createChannel();
        system.info("[RpcServer] Waiting for RPC messages on exchange : %s", this.exchangeDefinition.name);
    }

    // 메시지 받으면 실행할 비즈니스 로직
    async onSubscribe(messagePayload) {
        system.info('[RECIEVED] RPCServer: ', messagePayload);
        return {
            success: true,
            message: "this is response message by rpc-server!"
        };
    }

    async run() {
        if (!this.channel) {
            await this.init();
        }

        messageBroker.subscribeRpcMessage(this.channel, this.exchangeDefinition, "", this.bindingKey, this.onSubscribe);
    
        system.debug("RPCServer start");
        setInterval(() => {
            system.debug("RPCServer is running");
        }, env.HEARTBEAT_INTERVAL_MS);
    }

    async shutdown() {
        if (this.channel) {
            try {
                await this.channel.close();
                this.channel = null;
                system.debug("[RpcServer] Channel closed");
            } catch (err) {
                system.error("[RpcServer] Error closing channel:", err);
            }
        }
    }
}

module.exports = { RpcServer };