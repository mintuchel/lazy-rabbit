import { Worker, WorkerConfig } from "../../lib";
import { messageBroker } from "../lib/message-broker";
import { authHandlerMap } from "./handler";
import { Channel } from 'amqplib';

export class AuthService extends Worker {
    constructor(channel: Channel, config: WorkerConfig) {
        super(channel, config);
        this.registerHandlerMap(authHandlerMap);
    }

    async run(): Promise<void> {
        this.startHeartbeatLog();

        // to use dispatch in callback, we need to bind current "this" to use same context
        messageBroker.subscribeRpcMessage(this.channel, this.exchangeConfig, this.queueConfig, this.bindingKey, this.dispatch.bind(this));
    }
} 