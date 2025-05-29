import express from 'express';
import { handleDirectMessage } from '../controllers/direct.controller.js';

const router = express.Router();

router.post('/', handleDirectMessage);

export default router;