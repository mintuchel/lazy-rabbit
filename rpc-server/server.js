import { getConnection } from "../rabbitmq/index.js";
import { env } from "../config/index.js";

export class RpcServer {
    constructor() {
        // AppServer와 RpcServer 가 공통적으로 사용하는 큐
        this.queue = env.RPC_QUEUE_NAME;
        this.connection = null;
        this.channel = null;
    }

    async init() {
        this.connection = await getConnection();
        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue(this.queue, { durable: false });
        console.log("[RpcServer] Waiting for RPC requests on queue : %s", this.queue);
    }

    // 메시지 받으면 실행할 비즈니스 로직
    async handleMessage(messagePayload) {
        console.log('Received message:', messagePayload);
        return {
            success: true,
            message: "response message by rpc-server!"
        };
    }
    
    async run() {
      if (!this.channel) {
          await this.init();
      }

      this.channel.consume(this.queue, async (msg) => {
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