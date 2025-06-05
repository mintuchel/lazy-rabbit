import { messageBroker } from "../rabbitmq/index.js";

export class RpcServer {
    constructor(queueDefinition) {
        this.channel = null;
        this.queue = queueDefinition;
    }

    async init() {
        this.channel = await messageBroker.createChannel();
        await this.channel.assertQueue(this.queue.name, { durable: this.queue.durable });
        console.log("[RpcServer] Waiting for RPC requests on queue : %s", this.queue.name);
    }

    // 메시지 받으면 실행할 비즈니스 로직
    async handleMessage(messagePayload) {
        console.log('[RECIEVED] msg content:', messagePayload);
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
    }
    
    async shutdown() {
        if (this.channel) {
            try {
                await this.channel.close();
                console.log("[RpcServer] Channel closed");
            } catch (err) {
                console.error("[RpcServer] Error closing channel:", err);
            }
        }
    }
}