import express from 'express';
import { handleNotification } from '../controllers/\bnotification.controller';

const router = express.Router();

router.get('/notification', handleNotification);

export default router;