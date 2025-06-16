const { sendDirectMessage, sendLogMessage } = require("../services/direct.services");

async function handleDirectMessage(req, res) {
    // json형식인 request body만 전송
    sendDirectMessage(req.body);
    res.end();
}

async function handleLogMessage(req, res) {
    sendLogMessage(req.body);
    res.end();
}

module.exports = { handleDirectMessage, handleLogMessage };