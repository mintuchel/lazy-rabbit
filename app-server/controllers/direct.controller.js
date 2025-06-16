const { sendDirectMessage, sendLogMessage } = require("../services/direct.services");

/**
 * 아무리 RPC 메시지 발행이 아니어서 응답을 받을 필요가 없어도
 * res.end() res.send() res.json() 으로 응답을 보내는 코드는 있어야함
 */
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