export const AccountQuery = {
    FIND_ALL: 'SELECT uid, email, name FROM account',
    FIND_BY_ID: 'SELECT * FROM account WHERE uid = ?',
    SAVE: `INSERT INTO account (uid, email, name, password) VALUES (?, ?, ?, ?)`,
    UPDATE_BY_ID: `UPDATE account SET email = ?, name = ?, password = ? WHERE uid = ?`,
    DELETE_BY_ID: `DELETE FROM account WHERE uid = ?`,
}