const { sendRpcMessage } = require("../services/rpc.services");

async function handleRpcMessage(req, res) {
    // JSON에서 id, msg 값 파싱
    // const { id, msg } = req.body;
    const result = await sendRpcMessage(req.body);
    res.status(200).json(result);
}

module.exports = { handleRpcMessage };