import { getConnection } from '../../config/db.js'

export async function findProjects() {
    const conn = await getConnection();
    
    try {
        const [rows] = await conn.query('SELECT * FROM projects');
        return rows;
    } catch (err) {
        console.error('DB query error:', err);
        throw err;
    } finally {
        // connection pool 로 다시 반환
        conn.release();
    }
}