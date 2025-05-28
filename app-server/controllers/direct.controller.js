import { sendDirectMessage } from "../services/direct.services.js";

export async function handleDirect(req, res) {
    // json형식인 request body만 전송
    const result = await sendDirectMessage(req.body);
    res.status(200).json(result);
}