import express from 'express';
import { handleNotification } from '../controllers/rpc.controller.js';

const router = express.Router();

router.post('/', handleNotification);

export default router;