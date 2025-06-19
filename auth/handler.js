"use strict";

const system = require("../system");
const messageBroker = require("../rabbitmq");
const ExchangeDefinitions = require("../rabbitmq/config/exchange");

const map = new Map();

map.set('auth.login', async (channel, msg) => {
    console.log(msg);
    const payload = JSON.parse(msg.content.toString());
    system.info("[RECIEVED] AuthService (Login): ", payload);
    
    return {
        success: true,
        message: "Login Success!"
    };
});

map.set('auth.signup', async (channel, msg) => {
    const payload = JSON.parse(msg.content.toString());
    system.info("[RECIEVED] AuthService (SignUp): ", payload);

    return {
        success: true,
        message: "SignUp Success!"
    };
});

module.exports = map;