const { sendDirectMessage } = require("../services/direct.services");

async function handleDirectMessage(req, res) {
    // json형식인 request body만 전송
    const result = await sendDirectMessage(req.body);
    res.status(200).json(result);
}

module.exports = { handleDirectMessage };