"use strict";

const system = require("../system");

const map = new Map();

map.set('auth.login', async (msg) => {
    system.info("[RECIEVED] AuthService (Login): ", msg);
    return {
        success: true,
        message: "Login Success!"
    };
});

map.set('auth.signup', async (msg) => {
    system.info("[RECIEVED] AuthService (SignUp): ", msg);
    return {
        success: true,
        message: "SignUp Success!"
    };
});

module.exports = map;