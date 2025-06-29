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
    const payload = JSON.parse(msg.content.toString());
    system.info("[RECIEVED] AuthService (Login): ", payload);

    const correlationId = msg.properties.correlationId;
    const routingKey = getRandomRoutingKey(correlationId, 'login');

    messageBroker.publishToExchange(channel, ExchangeDefinitions.NOTIFICATION_EXCHANGE, routingKey, payload);

    return 'LOGIN SUCCESS!';
});

authHandlerMap.set('auth.signup', async (channel, msg) => {
    const payload = JSON.parse(msg.content.toString());
    system.info("[RECIEVED] AuthService (SignUp): ", payload);

    const correlationId = msg.properties.correlationId;
    const routingKey = getRandomRoutingKey(correlationId, 'signup');

    messageBroker.publishToExchange(channel, ExchangeDefinitions.NOTIFICATION_EXCHANGE, routingKey, payload);

    return 'SIGNUP SUCCESS!';
});

module.exports = authHandlerMap;