import express from 'express';
import { handleNotification } from '../controllers/notification.controller.js';

const router = express.Router();

router.post('/', handleNotification);

export default router;