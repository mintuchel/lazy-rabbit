import { getConnection } from '../../config/db.js'

export async function findProjects() {
    const conn = await getConnection();
    try {
        const [rows] = await conn.query('SELECT * FROM projects');
        console.log(rows);
    } catch (err) {
        console.error('DB query error:', err);
    }

    return rows[0] || null;
}