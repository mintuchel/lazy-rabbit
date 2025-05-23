import express from 'express';
import { handleGetIssuesCreatedAfter, handleGetOpenedIssues } from '../controllers/\bissue.controller';

const router = express.Router();

router.get('/', handleGetIssuesCreatedAfter);
router.get('/opened', handleGetOpenedIssues);

export default router;