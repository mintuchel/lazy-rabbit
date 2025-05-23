import express from 'express';
import { handleGetProjects } from '../controllers/project.controller.js';

const router = express.Router();

router.get('/', handleGetProjects);

export default router;