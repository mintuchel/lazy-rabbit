import express from 'express';
import { handleRpcMessage } from '../controllers/rpc.controller.js';

const router = express.Router();

router.post('/', handleRpcMessage);

export default router;