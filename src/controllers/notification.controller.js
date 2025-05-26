import { sendNotification } from "../services/notification.services.js";

export async function handleNotification(req, res) {
    // JSON에서 id, msg 값 파싱
    const { id, msg } = req.body;
    const result = await sendNotification(id, msg);
    res.status(200).json(result);
}