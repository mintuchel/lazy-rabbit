const messageBroker = require("../lib/message-broker");
const Worker = require("../../lib/worker");
const { env } = require('../config');
const system = require("../system");
const authHandlerMap = require("./handler");

class AuthService extends Worker {
    constructor(channel, config) {
        super(channel, config);
        this.registerHandlerMap(authHandlerMap);
    }

    async run() {
        // if (!this.channel) {
        //     const channel = await messageBroker.createChannel();
        //     await this.init(channel);
        // }

        // to use dispatch in callback, we need to bind current "this" to use same context
        messageBroker.subscribeRpcMessage(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.dispatch.bind(this));

        system.debug("AuthService start");

        setInterval(() => {
            system.debug("AuthService is running");
        }, env.HEARTBEAT_INTERVAL_MS);
    }
}

module.exports = AuthService;