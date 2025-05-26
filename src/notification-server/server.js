import { getConnection } from "../rabbitmq/index.js";
import { env } from "../config/index.js";

// const queue = env.RPC_QUEUE_NAME;

export class NotificationServer {
    constructor() {
        this.queueName = env.RPC_QUEUE_NAME;
        this.connection = null;
        this.channel = null;
    }

    async init() {
        //this.queueName = env.RPC_QUEUE_NAME;
        this.connection = await getConnection();
        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue(this.queueName, { durable: false });
        console.log("[x] Awaiting RPC requests on %s", this.queueName);
    }

    async run(handleMessage) {
        if (!this.channel) {
            await this.init();
        }

        this.channel.consume(this.queueName, async (msg) => {
            if (!msg) return;
      
            const messagePayload = JSON.parse(msg.content.toString());
            console.log('Received message:', messagePayload);
      
            try {
              const responsePayload = await handleMessage(messagePayload);
      
              this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(responsePayload)),
                {
                  correlationId: msg.properties.correlationId,
                }
              );
            } catch (err) {
              console.error("Error handling RPC request:", err);
            }
      
            this.channel.ack(msg);
        });
    }
}