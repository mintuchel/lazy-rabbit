import { sendNotificationMessage } from "../services/notification.services.js";

export async function handleNotificationMessage(req, res) {
    const result = await sendNotificationMessage(req.body);
    res.status(200).json(result);
}