import { Worker, WorkerConfig } from "../../lib";
import { messageBroker } from "../lib/message-broker";
import { system } from "../system";
import { Channel, Message } from 'amqplib';

export class SMSWorker extends Worker {
    constructor(channel: Channel, config: WorkerConfig) {
        super(channel, config);
    }

    async onDispatch(channel: Channel, msg: Message): Promise<void> {
        const payload = JSON.parse(msg.content.toString());
        system.info("[RECIEVED] Worker (SMS): ", payload);

        // custom error generator for testing
        const num = Math.random();
        if (num < 0.5) {
            system.error("[REJECT] Worker(SMS): randomly rejecting message");
            channel.nack(msg, false, false);
            return;
        }

        system.info("[PROCESSED] SMS Worker successfully processed:");
        channel.ack(msg);
    }

    async run(): Promise<void> {
        this.startHeartbeatLog();
        messageBroker.subscribeToExchange(this.channel, this.exchangeConfig, this.queueConfig, this.bindingKey, this.onDispatch.bind(this));
    }
} 