import { createClient } from 'redis';

let connection;

// 싱글톤으로 redis 사용
export async function getConnection() {
    if (connection) return connection;

    connection = createClient();

    connection.on('error', (err) => {
        console.error('Redis Client Error', err);
    });

    await connection.connect();
    return connection;
}