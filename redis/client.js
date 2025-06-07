const { createClient } = require('redis');
const { env } = require('../config');

let client;

async function getClient() {
    if (client) return client;

    client = createClient({
        socket: {
            host: env.REDIS_HOST,
            port: env.REDIS_PORT
        }
    });

    // client는 eventEmitter를 상속한 클래스이기 때문에 on 사용 가능
    client.on('error', (err) => {
        console.error('Redis Client Error', err);
    });

    // Redis 서버와 실제로 TCP 연결을 맺는 비동기 작업
    // connect()는 내부적으로 인증, 핸드셰이크 등을 처리함
    await client.connect();
    return client;
}

module.exports = { getClient };