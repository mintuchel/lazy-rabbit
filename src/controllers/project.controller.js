import { getProjects } from "../services/project.services.js";

export async function handleGetProjects(req, res) {
    const projects = await getProjects();
    res.status(200).json(projects); 
};