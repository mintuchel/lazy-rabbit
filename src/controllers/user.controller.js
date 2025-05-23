import { sendEmailByUserId } from "../services/user.services.js";

export async function handleSendEmail(req, res) {
    const result = await sendEmailByUserId(1);
    res.status(200).json(result);
}