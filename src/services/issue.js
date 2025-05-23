import { findIssuesCreatedAfter, findOpenIssues } from "../models/issue.js";

export async function getIssuesCreatedAfter(date) {
    return await findIssuesCreatedAfter(date);
}

export async function getOpenIssues() {
    return await findOpenIssues();
}