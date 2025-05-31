import express from 'express';
import { AccountController } from '../controllers/account.controller.js';

const router = express.Router();

// GET /account
router.get('/', AccountController.handleGetAccounts);
// GET /account/:uid'
router.get('/:uid', AccountController.handleGetAccountById);
// POST /account
router.post('/', AccountController.handleCreateAccount);
// UPDATE /account
router.patch('/', AccountController.handleUpdateAccount);
// DELETE /account
router.delete('/', AccountController.handleDeleteAccount);

export default router;