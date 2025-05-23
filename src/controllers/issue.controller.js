import { getIssuesCreatedAfter, getOpenedIssues } from '../services/issue.services.js';

export async function handleGetIssuesCreatedAfter(req, res) {
    const created = req.query.created;

    if (!created) {
        return res.status(400).json({ error: 'Missing created date query parameter' });
    }

    const issues = await getIssuesCreatedAfter(created);
    res.status(200).json(issues);
}

export async function handleGetOpenedIssues(req, res) {
    const openedIssues = await getOpenedIssues();
    res.status(200).json(openedIssues);
}