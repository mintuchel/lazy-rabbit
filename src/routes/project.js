import express from 'express';
import { getProjects } from '../services/project.js';

const router = express.Router();

router.get('/', async function (req, res) {
    const projects = await getProjects();
    res.status(200).json(projects); 
});

export default router;