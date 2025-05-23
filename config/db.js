import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// mysql2가 mysql보다 더 빠르고 성능 좋고, Promise 지원까지 해줌.
export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
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