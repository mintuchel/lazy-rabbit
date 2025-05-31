import { AccountService } from '../services/account.services.js';

export const AccountController = {
    async handleGetAccounts(req, res) {
        const accounts = await AccountService.getAccounts();
        res.status(200).json(accounts);
    },

    async handleGetAccountById(req, res) {
        // 간단한 경우는 구조분해할당 안하고 바로 파싱
        const uid = req.params.uid;
        const account = await AccountService.getAccountById(uid);
        res.status(200).json(account);
    },

    async handleCreateAccount(req, res) {
        // request body에서 json 객체 파싱
        // 파싱할게 많은 경우에는 구조분해할당 사용
        const { uid, email, name, password } = req.body;
        await AccountService.createAccount({ uid, email, name, password });
        res.status(201).json({ message: 'Account created' });
    },

    async handleUpdateAccount(req, res) {
        const { uid, email, name, password } = req.body;
        await AccountService.updateAccount({ uid, email, name, password });
        res.status(204).json({ message: 'Account updated' });
    },

    async handleDeleteAccount(req, res) {
        const uid = req.params.uid;
        await AccountService.deleteAccount(uid);
        res.status(204).json({ message: 'Account deleted' });
    }
}