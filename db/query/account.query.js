export const AccountQuery = {
    FIND_ALL: 'CALL MJH_find_all_accounts();',
    FIND_BY_ID: 'CALL MJH_find_account_by_id(?)',
    SAVE: `CALL MJH_save_account(?, ?, ?, ?)`,
    UPDATE_BY_ID: `CALL MJH_update_account_by_id(?, ?, ?, ?)`,
    DELETE_BY_ID: `CALL MJH_delete_account_by_id(?)`,
}