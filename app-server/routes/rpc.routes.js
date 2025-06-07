const express = require('express');
const { handleRpcMessage } = require('../controllers/rpc.controller');

const router = express.Router();

router.post('/', handleRpcMessage);

module.exports = router;