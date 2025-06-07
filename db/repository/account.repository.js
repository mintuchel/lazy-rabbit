const { getConnection } = require("../connection");
const { AccountQuery } = require("../query/account.query");

const AccountRepository = {
    async findAll() {
        const conn = await getConnection();
        try {
            const [rows] = await conn.query(AccountQuery.FIND_ALL);
            return rows;
        } catch (err) {
            console.error('findAll query error:', err);
            throw err;
        } finally {
            // connection pool 로 다시 반환
            conn.release();
        }
    },

    async findById(uid) {
        const conn = await getConnection();
        try {
            // java 의 preparedStatement 같은 결과
            // 쿼리문의 ? 에 인자를 넣으려면 [ ] 를 사용해야함
            const [rows] = await conn.query(AccountQuery.FIND_BY_ID, [uid]);
            return rows;
        } catch (err) {
            console.error('findById query error:', err);
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
            console.error('save query error:', err);
            throw err;
        } finally {
            conn.release();
        }
    },

    async updateById({ uid, email, name, password }) {
        const conn = await getConnection();
        try {
            // preparedStatement 사용할때는 인자 주입 순서가 중요함
            await conn.execute(AccountQuery.UPDATE_BY_ID, [email, name, password, uid]);
        } catch (err) {
            console.error('updateById query error:', err);
            throw err;
        } finally {
            // connection pool 로 다시 반환
            conn.release();
        }
    },

    async deleteById(uid) {
        const conn = await getConnection();
        try {
            await conn.execute(AccountQuery.DELETE_ACCOUNT, [uid]);
        } catch (err) {
            console.error('deleteById query error:', err);
            throw err;
        } finally {
            conn.release();
        }
    }
};

module.exports = { AccountRepository };