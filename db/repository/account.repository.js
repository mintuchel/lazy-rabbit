import { getConnection } from "../connection.js";
import { AccountQuery } from "../query/account.query.js";

export const AccountRepository = {
    async findAll(){
        const conn = await getConnection();
        try {
            // java 의 preparedStatement 같은 결과 
            const [rows] = await conn.query(AccountQuery.FIND_ALL);
            return rows;
        } catch (err) {
            console.error('DB query error:', err);
            throw err;
        } finally {
            // connection pool 로 다시 반환
            conn.release();
        }  
    },

    async findById(uid){
        const conn = await getConnection();
        try {
            // java 의 preparedStatement 같은 결과 
            const [rows] = await conn.query(AccountQuery.FIND_BY_ID, [uid]);
            return rows;
        } catch (err) {
            console.error('DB query error:', err);
            throw err;
        } finally {
            // connection pool 로 다시 반환
            conn.release();
        }  
    },

    async save({ uid, email, name, password }) {
        const conn = await getConnection();
        try {
            await conn.execute(AccountQuery.SAVE, [uid, email, name, password]);
        } catch (err) {
            console.error('DB query error:', err);
            throw err;
        } finally {
            conn.release();
        }
    },

    async updateById({uid}) {
        const conn = await getConnection();
        try {
            await conn.execute(AccountQuery.UPDATE_BY_ID, [uid]);
        } catch (err) {
            console.error('DB query error:', err);
            throw err;
        } finally {
            // connection pool 로 다시 반환
            conn.release();
        }
    },

    async deleteById(id) {
        const conn = await getConnection();
        try {
            await conn.execute(AccountQuery.DELETE_ACCOUNT, [id]);
        } catch (err) {
            console.error('DB query error:', err);
            throw err;
        } finally {
            // connection pool 로 다시 반환
            conn.release();
        }
    }
}