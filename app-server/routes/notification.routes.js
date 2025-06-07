const express = require('express');
const { handleNotificationMessage } = require('../controllers/notification.controller');

const router = express.Router();

router.post('/', handleNotificationMessage);

module.exports = router;