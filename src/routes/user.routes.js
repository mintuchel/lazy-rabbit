import express from 'express';
import { handleSendEmail } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/email', handleSendEmail);

export default router;