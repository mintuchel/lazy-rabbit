"use strict";

const { EventEmitter } = require('events');
const system = require('../../../system');

class MessageDispatcher extends EventEmitter {

    #handlerMap = null;

    constructor() {
        super();
        this.#handlerMap = new Map();

        this.on('notfound', (routingKey) => {
            system.info('[MessageDispatcher] Cannot find handler matched with', routingKey);
        });

        this.on('error', (err) => {
            system.info('[MessageDispatcher] Error when dispatching... :', err);
        });
    }

    // 핸들러 등록
    registerHandler(routingKey, callback) {
        this.#handlerMap.set(routingKey, callback);
    }

    // 특정 routingKey에 해당하는 콜백함수 실행
    async dispatch(msg) {
        const routingKey = msg.fields.routingKey;
        const payload = JSON.parse(msg.content.toString());

        if (!this.#handlerMap.has(routingKey)) {
            this.emit('notfound', routingKey);
        }

        const handler = this.#handlerMap.get(routingKey);

        try {
            const result = await handler(payload);
            return result;
        } catch (err) {
            this.emit('error', err);
            throw err;
        }
    }
}

module.exports = MessageDispatcher;