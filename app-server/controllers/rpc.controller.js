const { sendRpcMessage } = require("../services/rpc.services");

async function handleRpcMessage(req, res) {
    // JSON에서 id, msg 값 파싱
    // const { id, msg } = req.body;
    // RPC 메시지는 응답이 있으니 await 해주고 result 보내줘야함!
    const result = await sendRpcMessage(req.body);
    res.status(200).json(result);
}

module.exports = { handleRpcMessage };