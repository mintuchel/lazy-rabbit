import { findIssuesCreatedAfter, findOpenedIssues } from "../db/repository/issue.repository.js";

export async function getIssuesCreatedAfter(date) {
    return await findIssuesCreatedAfter(date);
}

export async function getOpenedIssues() {
    return await findOpenedIssues();
}