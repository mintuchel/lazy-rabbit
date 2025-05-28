import { getConnection, subscribeMessage } from "../rabbitmq/index.js";
import { getConnection } from "../rabbitmq/index.js";

export class DirectServer {
    constructor() {
        this.connection = null;
        this.channel = null;
    }

    async init() {
        this.connection = await getConnection();
        this.channel = await this.connection.createChannel();
        console.log("[DirectServer] Waiting for direct routing requests");
    }

    async run() {
        if (!this.channel) {
            await this.init();
        }
        
        subscribeMessage(this.channel, "A");
    }
}