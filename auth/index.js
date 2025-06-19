const messageBroker = require("../rabbitmq");
const { env } = require('../config');
const WorkerDefinitions = require("../rabbitmq/config/worker");
const Worker = require("../rabbitmq/worker");
const system = require("../system");
const handlers = require("./handler");

class AuthService extends Worker {
    constructor() {
        super(WorkerDefinitions.AUTH_SERVICE);
        for (const [key, value] of handlers) {
            this.registerHandler(key, value);
        }
    }

    async run() {
        if (!this.channel) {
            await this.init();
        }

        // to use dispatch in callback, we need to bind current "this" to use same context
        messageBroker.subscribeRpcMessage(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.dispatch.bind(this));

        system.debug("AuthService start");

        setInterval(() => {
            system.debug("AuthService is running");
        }, env.HEARTBEAT_INTERVAL_MS);
    }
}

module.exports = AuthService;