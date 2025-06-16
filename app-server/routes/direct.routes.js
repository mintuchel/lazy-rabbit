const express = require('express');
const { handleDirectMessage, handleLogMessage } = require('../controllers/direct.controller');

const router = express.Router();

router.post('/', handleDirectMessage);
router.post('/log', handleLogMessage);

module.exports = router;