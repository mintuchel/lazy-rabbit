import { getConnection } from "../../config/db.js";

export async function findIssuesCreatedAfter(date) {
    const conn = await getConnection();

    try {
        const [rows] = await conn.query('SELECT * FROM issues WHERE created_on > ?', [date]);
        return rows;
    } catch (err) {
        console.error('DB query error:', err);
        throw err;
    } finally {
        // connection pool 로 다시 반환
        conn.release();
    }    
}

export async function findOpenedIssues() {
    const conn = await getConnection();
    
    try {
        const [rows] = await conn.query('SELECT * FROM issues WHERE closed_on IS NULL');
        return rows;
    } catch (err) {
        console.error('DB query error:', err);
        throw err;
    } finally {
        // connection pool 로 다시 반환
        conn.release();
    }    
}