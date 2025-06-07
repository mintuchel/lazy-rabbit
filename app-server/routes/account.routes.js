const express = require('express');
const { AccountController } = require('../controllers/account.controller');

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
// POST /account/login
router.post('/login', AccountController.handleLogin);

module.exports = router;