import express from 'express';
import { handleTopicMessage } from '../controllers/topic.controller.js';

const router = express.Router();

router.post('/', handleTopicMessage);

export default router;