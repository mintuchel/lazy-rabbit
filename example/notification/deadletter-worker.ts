import { Worker, WorkerConfig } from "../../lib";
import { messageBroker } from "../lib/message-broker";
import { system } from "../system";
import { Channel, Message } from 'amqplib';

export class DeadLetterWorker extends Worker {
    constructor(channel: Channel, config: WorkerConfig) {
        super(channel, config);
    }

    onDispatch(channel: Channel, msg: Message): void {
        const payload = JSON.parse(msg.content.toString());
        const routingKey = msg.fields.routingKey;
        system.error("[RECIEVED] DEAD-LETTER-WORKER: ", payload, "routingKey:", routingKey);
    }

    async run(): Promise<void> {
        this.startHeartbeatLog();

        messageBroker.subscribeToExchange(this.channel, this.exchangeConfig, this.queueConfig, this.bindingKey, this.onDispatch.bind(this));
    }
} 