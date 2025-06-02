import { getConnection } from "./connection.js";

export const RedisService = {
    async findAll(key) {
        const client = await getConnection();
        return await client.hGetAll(key);
    },

    async save(key, value) {
        const client = await getConnection();
        return await client.set(key, value);
    },

    async findByKey(key) {
        const client = await getConnection();
        return await client.get(key);
    },

    async deleteByKey(key) {
        const client = await getConnection();
        return await client.del(key);
    },

    async setExpire(key, seconds) {
        const client = await getConnection();
        return await client.expire(key, seconds);
    }
};