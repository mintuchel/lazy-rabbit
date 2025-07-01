const { Worker } = require("../../lib");
const messageBroker = require("../lib/message-broker");
const authHandlerMap = require("./handler");

class AuthService extends Worker {
    constructor(channel, config) {
        super(channel, config);
        this.registerHandlerMap(authHandlerMap);
    }

    async run() {
        this.startHeartbeatLog();

        // to use dispatch in callback, we need to bind current "this" to use same context
        messageBroker.subscribeRpcMessage(this.channel, this.exchangeDefinition, this.queueDefinition, this.bindingKey, this.dispatch.bind(this));
    }
}

module.exports = AuthService;