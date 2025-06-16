const { sendNotificationMessage } = require("../services/notification.services");

async function handleNotificationMessage(req, res) {
    sendNotificationMessage(req.body);
    res.end();
}

module.exports = { handleNotificationMessage };