"use strict";

const system = require("../system");
const messageBroker = require("../lib/message-broker");
const ExchangeDefinitions = require("../config/rabbitmq/exchange");
const routingKeys = require("./routing");
const authHandlerMap = new Map();

const routingKeyList = [routingKeys.SMS_NOTIFICATION_RK, routingKeys.EMAIL_NOTIFICATION_RK, routingKeys.SLACK_NOTIFICATION_RK];

function getRandomRoutingKey(correlationId, type) {
    const index = [...correlationId].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % routingKeyList.length;
    return routingKeyList[index] + '.' + type;
}

authHandlerMap.set('auth.login', async (channel, msg) => {
    try {
        const payload = JSON.parse(msg.content.toString());
        system.info("[RECIEVED] AuthService (Login): ", payload);

        const correlationId = msg.properties.correlationId;
        const routingKey = getRandomRoutingKey(correlationId, 'login');

        messageBroker.publishToExchange(channel, ExchangeDefinitions.NOTIFICATION_EXCHANGE, routingKey, payload);
        
        channel.ack(msg);
        return 'LOGIN SUCCESS!';
    } catch (err) {
        channel.nack(msg, false, false);
        throw new Error(err);
    }
});

authHandlerMap.set('auth.signup', async (channel, msg) => {
    try {
        const payload = JSON.parse(msg.content.toString());
        system.info("[RECIEVED] AuthService (SignUp): ", payload);

        const correlationId = msg.properties.correlationId;
        const routingKey = getRandomRoutingKey(correlationId, 'signup');

        messageBroker.publishToExchange(channel, ExchangeDefinitions.NOTIFICATION_EXCHANGE, routingKey, payload);
        
        channel.ack(msg);
        return 'SIGNUP SUCCESS!';
    } catch (err) {
        channel.nack(msg, false, false);
        throw new Error(err);
    }
});

module.exports = authHandlerMap;