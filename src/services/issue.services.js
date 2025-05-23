import { findIssuesCreatedAfter, findOpenedIssues } from "../models/issue.models.js";

export async function getIssuesCreatedAfter(date) {
    return await findIssuesCreatedAfter(date);
}

export async function getOpenedIssues() {
    return await findOpenedIssues();
}