"use strict";

const system = require("../system");
const messageBroker = require("../rabbitmq");
const ExchangeDefinitions = require("../rabbitmq/config/exchange");

const map = new Map();

function getRandomRoutingKey(correlationId, type) {
    const targets = ["notification.sms", "notification.slack", "notification.email"];
    const index = [...correlationId].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % targets.length;
    return targets[index] + '.' + type;
}

map.set('auth.login', async (channel, msg) => {
    const payload = JSON.parse(msg.content.toString());
    system.info("[RECIEVED] AuthService (Login): ", payload);
    
    // correlationId로 랜덤한 notification worker로 전송하기 위해 routingKey 만들기
    const correlationId = msg.properties.correlationId;
    const routingKey = getRandomRoutingKey(correlationId, 'login');

    messageBroker.publishToExchange(channel, ExchangeDefinitions.NOTIFICATION_EXCHANGE, routingKey, payload);

    return {
        success: true,
        message: "Login Success!"
    };
});

map.set('auth.signup', async (channel, msg) => {
    const payload = JSON.parse(msg.content.toString());
    system.info("[RECIEVED] AuthService (SignUp): ", payload);

    // correlationId로 랜덤한 notification worker로 전송하기 위해 routingKey 만들기
    const correlationId = msg.properties.correlationId;
    const routingKey = getRandomRoutingKey(correlationId, 'signup');
    
    messageBroker.publishToExchange(channel, ExchangeDefinitions.NOTIFICATION_EXCHANGE, routingKey, payload);

    return {
        success: true,
        message: "SignUp Success!"
    };
});

module.exports = map;