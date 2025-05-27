import { getConnection } from "../rabbitmq/index.js";
import { env } from "../config/index.js";

export class NotificationServer {
    constructor() {
        this.queueName = env.NOTIFICATION_QUEUE_NAME;
        this.connection = null;
        this.channel = null;
    }

    async init() {
        this.connection = await getConnection();
        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue(this.queueName, { durable: false });
        console.log("[NotificationServer] Waiting for RPC requests on %s", this.queueName);
    }

    // 클래스 내부에 비즈니스 로직 정의
    async handleMessage(messagePayload) {
        console.log('Received message:', messagePayload);
        return {
            success: true,
            message: "response message by notification-server!"
        };
    }
    // 외부에서 콜백을 받지 않고, 내부 메서드를 사용
    async run() {
      if (!this.channel) {
          await this.init();
      }

      this.channel.consume(this.queueName, async (msg) => {
          if (!msg) return;

          const messagePayload = JSON.parse(msg.content.toString());

          try {
              const responsePayload = await this.handleMessage(messagePayload);

              this.channel.sendToQueue(
                  msg.properties.replyTo,
                  Buffer.from(JSON.stringify(responsePayload)),
                  { correlationId: msg.properties.correlationId }
              );
          } catch (err) {
              console.error("Error handling RPC request:", err);
          }

          this.channel.ack(msg);
      });
  }
}