import { Worker, WorkerConfig } from "../../lib";
import { messageBroker } from "../lib/message-broker";
import { system } from "../system";
import * as amqp from 'amqplib';

export class SlackWorker extends Worker {
    constructor(channel: amqp.Channel, config: WorkerConfig) {
        super(channel, config);
    }

    onDispatch(channel: amqp.Channel, msg: amqp.Message): void {
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