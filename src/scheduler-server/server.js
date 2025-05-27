import { getConnection } from "../rabbitmq/index.js";
import { env } from "../config/index.js";

export class SchedulerServer {
    constructor() {
        this.queueName = env.SCHEDULER_QUEUE_NAME;
        this.connection = null;
        this.channel = null;
    }

    async init() {
        this.connection = await getConnection();
        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue(this.queueName, { durable: false });
        console.log("[SchedulerServer] Waiting for RPC requests on %s", this.queueName);
    }

    // 클래스 내부에 비즈니스 로직 정의
    async handleMessage(messagePayload) {
        console.log('Received message:', messagePayload);
        return {
            success: true,
            message: "response message by scheduler-server!"
        };
    }

    async run() {
        if (!this.channel) {
          await this.init();
        }

        // 메시지를 받으면 콜백함수 실행
        // 콜백함수를 function으로 사용하면 에러 터짐
        // 화살표 함수는 상위 스코프의 this를 가져오기 때문에 화살표 함수를 사용해야함
        this.channel.consume(this.queueName, async (msg) => {
            if (!msg) return;
      
            const messagePayload = JSON.parse(msg.content.toString());
  
            try {
                const responsePayload = await this.handleMessage(messagePayload);
      
                this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(responsePayload)),
                  {
                    correlationId: msg.properties.correlationId,
                 }
                );
            }catch (err) {
               console.error("Error handling RPC request:", err);
            }
      
            this.channel.ack(msg);
        });
    }
}