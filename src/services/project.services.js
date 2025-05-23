import { findProjects } from '../models/project.models.js'

export async function getProjects() {
    return await findProjects();
}