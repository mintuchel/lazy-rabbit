import { sendDirectMessage } from "../services/direct.services.js";

export async function handleDirect(req, res) {
    // JSON에서 id, msg 값 파싱
    // const { id, msg } = req.body;
    const result = await sendDirectMessage(req.body);
    res.status(200).json(result);
}