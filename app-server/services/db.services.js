import { findIssuesCreatedAfter, findOpenedIssues } from "../../db/repository/db.repository.js";

export async function getIssuesCreatedAfter(date) {
    return await findIssuesCreatedAfter(date);
}

export async function getOpenedIssues() {
    return await findOpenedIssues();
}