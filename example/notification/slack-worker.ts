import { Worker, WorkerConfig } from "../../lib";
import { messageBroker } from "../lib/message-broker";
import { system } from "../system";
import { Channel, Message } from 'amqplib';

export class SlackWorker extends Worker {
    constructor(channel: Channel, config: WorkerConfig) {
        super(channel, config);
    }

    async onDispatch(channel: Channel, msg: Message): Promise<void> {
        const payload = JSON.parse(msg.content.toString());
        system.info("[RECIEVED] Worker (Slack): ", payload);

        // custom error generator for testing
        const num = Math.random();
        if (num < 0.5) {
            system.error("[ERROR] Slack Worker : throwing random error");
            throw new Error("Random error occurred in Slack Worker");
        }

        system.info("[PROCESSED] Slack Worker : successfully processed");
        channel.ack(msg);
    }

    async run(): Promise<void> {
        this.startHeartbeatLog();
        messageBroker.subscribeToExchange(this.channel, this.exchangeConfig, this.queueConfig, this.bindingKey, this.onDispatch.bind(this));
    }
} 