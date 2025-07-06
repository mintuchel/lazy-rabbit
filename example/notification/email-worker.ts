import { Worker, WorkerConfig } from "../../lib";
import { messageBroker } from "../lib/message-broker";
import { system } from "../system";
import * as amqp from 'amqplib';

export class EmailWorker extends Worker {
    constructor(channel: amqp.Channel, config: WorkerConfig) {
        super(channel, config);
    }

    onDispatch(channel: amqp.Channel, msg: amqp.Message): void {
        const payload = JSON.parse(msg.content.toString());
        system.info("[RECIEVED] Worker (Email): ", payload);

        // custom error generator for testing
        const num = Math.random();
        if (num < 0.5) {
            system.error("[TIMEOUT] Email Worker simulating timeout - no ack/nack:", payload);
            // ack/nack을 하지 않으면 TTL(3초) 후 deadletter로 이동
            return;
        }

        system.info("[PROCESSED] Email Worker successfully processed:", payload);
        channel.ack(msg);
    }

    async run(): Promise<void> {
        this.startHeartbeatLog();

        messageBroker.subscribeToExchange(this.channel, this.exchangeConfig, this.queueConfig, this.bindingKey, this.onDispatch.bind(this));
    }
} 