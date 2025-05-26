import { sendNotification } from "../services/notification.services";

export async function handleNotification(req, res) {
    // JSON에서 msg 추출
    const { msg } = req.body;
    const result = await sendNotification(msg);
    res.status(200).json(result);
}