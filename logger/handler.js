"use strict";

const system = require("../system");

const map = new Map();

map.set('logger.warn', async (msg) => {
    system.warning("[RECIEVED] Logger :", msg);
});

map.set('logger.error', async (msg) => {
    system.error("[RECIEVED] Logger :")
});

module.exports = map;