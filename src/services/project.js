import { findProjects } from "../models/project.js";

export async function getProjects() {
    return await findProjects();
}