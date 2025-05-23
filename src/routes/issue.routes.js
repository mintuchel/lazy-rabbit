import express from 'express';
import { handleGetIssuesCreatedAfter, handleGetOpenedIssues } from '../controllers/issue.controller.js';

const router = express.Router();

router.get('/', handleGetIssuesCreatedAfter);
router.get('/opened', handleGetOpenedIssues);

export default router;