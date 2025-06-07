const { getClient } = require('./client');
const { EventEmitter } = require('events');

class RedisAgent extends EventEmitter {
    constructor() {
        super();
    }

    async set(key, value) {
        const client = await getClient();
        return await client.set(key, value);
    }

    async get(key) {
        const client = await getClient();
        return await client.get(key);
    }

    async del(key) {
        const client = await getClient();
        return await client.del(key);
    }

    async expire(key, seconds) {
        const client = await getClient();
        return await client.expire(key, seconds);
    }

    async keys(pattern) {
        const client = await getClient();
        return await client.keys(pattern);
    }

    async hgetall(key) {
        const client = await getClient();
        return await client.hGetAll(key);
    }

    // Redis는 문자열 기반 저장소이기 때문에 json, boolean, null 같은 비문자 object도 오류 테스트해봐야 함.
    // JSON.stringify()로 전처리를 하자.
    async hmset(key, obj) {
        const client = await getClient();
        return await client.hSet(key, obj);
    }

    async hget(key, field) {
        const client = await getClient();
        return await client.hGet(key, field);
    }
}

const redisAgent = new RedisAgent();
module.exports = { redisAgent };