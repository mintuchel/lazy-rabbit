const express = require('express');
const { handleDirectMessage } = require('../controllers/direct.controller');

const router = express.Router();

router.post('/', handleDirectMessage);

module.exports = router;