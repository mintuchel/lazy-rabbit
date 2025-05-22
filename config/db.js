import mysql from 'mysql2/promise';

// mysql2가 mysql보다 더 빠르고 성능 좋고, Promise 지원까지 해줌.
export const pool = mysql.createPool({
    host: '121.134.190.80',
    port: 4406,
    user: 'root',
    password: 'development',
    database: 'redmine',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function getConnection() {
    try {
        const connection = await pool.getConnection();
        return connection;
    } catch (err) {
        console.error('Failed to get DB connection:', err);
        throw err;
    }
}