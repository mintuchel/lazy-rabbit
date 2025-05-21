import mysql from 'mysql2/promise';

// mysql2가 mysql보다 더 빠르고 성능 좋고, Promise 지원까지 해줌.
export const pool = mysql.createPool({
    host: '121.134.190.80',
    user: 'root',
    password: 'development',
    database: 'redmine',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});