const { sendNotificationMessage } = require("../services/notification.services");

async function handleNotificationMessage(req, res) {
    const result = await sendNotificationMessage(req.body);
    res.status(200).json(result);
}

module.exports = { handleNotificationMessage };