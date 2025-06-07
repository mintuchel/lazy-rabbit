const mysql = require('mysql2/promise');
const { env } = require('../config');

// mysql2가 mysql보다 더 빠르고 성능 좋고, Promise 지원까지 해줌.
const pool = mysql.createPool({
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function getConnection() {
    try {
        const connection = await pool.getConnection();
        return connection;
    } catch (err) {
        console.error('Failed to get DB connection:', err);
        throw err;
    }
}

module.exports = { getConnection };