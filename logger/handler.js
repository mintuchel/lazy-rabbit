"use strict";

const system = require("../system");

async function onWarn(msg) {
    system.warning("[RECIEVED] Logger :", msg);
}

async function onError(msg) {
    system.error("[RECIEVED] Logger :", msg);
}

module.exports = { onWarn, onError };