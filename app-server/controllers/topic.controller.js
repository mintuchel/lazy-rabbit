import { sendTopicMessage } from "../services/topic.services.js";

export async function handleTopicMessage(req, res) {
    const result = await sendTopicMessage(req.body);
    res.status(200).json(result);
}