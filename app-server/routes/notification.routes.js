import express from 'express';
import { handleNotificationMessage } from '../controllers/notification.controller.js';

const router = express.Router();

router.post('/', handleNotificationMessage);

export default router;