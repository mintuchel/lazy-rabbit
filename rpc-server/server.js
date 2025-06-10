const { messageBroker } = require("../rabbitmq");
const { env } = require('../config');
const system = require("../system");

class RpcServer {
    constructor(queueDefinition) {
        this.channel = null;
        this.queue = queueDefinition;
    }

    async init() {
        this.channel = await messageBroker.createChannel();
        await this.channel.assertQueue(this.queue.name, { durable: this.queue.durable });
        system.info("[RpcServer] Waiting for RPC requests on queue : %s", this.queue.name);
    }

    // 메시지 받으면 실행할 비즈니스 로직
    async handleMessage(messagePayload) {
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

        messageBroker.recieveRpcMessage(this.channel, this.queue, this.handleMessage);
    
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