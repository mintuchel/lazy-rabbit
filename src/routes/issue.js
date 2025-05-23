import express from 'express';
import { getIssuesCreatedAfter, getOpenIssues } from '../services/issue.js';

const router = express.Router();

router.get('/', async function (req, res) {
    const created = req.query.created;

    if (!created) {
        return res.status(400).json({ error: 'Missing created date query parameter' });
    }

    const issues = await getIssuesCreatedAfter(created);
    res.status(200).json(issues);
});

router.get('/open', async function (req, res) {
    const openedIssues = await getOpenIssues();
    res.status(200).json(openedIssues);
});

export default router;