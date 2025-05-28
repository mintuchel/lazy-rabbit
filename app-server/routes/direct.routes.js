import express from 'express';
import { handleDirect } from '../controllers/direct.controller.js';

const router = express.Router();

router.post('/', handleDirect);

export default router;