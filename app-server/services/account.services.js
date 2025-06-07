const { AccountRepository } = require("../../db/repository/account.repository");
const { RedisService } = require("../../redis");

const AccountService = {
    async getAccounts() {
        return await AccountRepository.findAll();
    },

    async getAccountById(uid) {
        return await AccountRepository.findById(uid);
    },

    async createAccount({ uid, email, name, password }) {
        return await AccountRepository.save({ uid, email, name, password });
    },

    async updateAccount({ uid, email, name, password }) {
        return await AccountRepository.updateById({ uid, email, name, password });
    },

    async deleteAccount(uid) {
        return await AccountRepository.deleteById(uid);
    },

    async login(uid, password) {
        await RedisService.save(uid, password);
    }
};

module.exports = { AccountService };