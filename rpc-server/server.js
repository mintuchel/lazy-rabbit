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

      this.channel.consume(this.queue.name, async (msg) => {
          if (!msg) return;

          const messagePayload = JSON.parse(msg.content.toString());

          try {
              const responsePayload = await this.handleMessage(messagePayload);

              // 다시 AppServer에게 보내기 위해 replyTo 큐를 활용해서 응답 결과 전송
              this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(responsePayload)),
                  {
                      correlationId: msg.properties.correlationId
                  }
              );
          } catch (err) {
              console.error("Error handling RPC request:", err);
          }

          this.channel.ack(msg);
      });
  }
}