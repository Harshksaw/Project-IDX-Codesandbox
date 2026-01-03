import { v4 as uuid4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import directoryTree from 'directory-tree';
import { execPromisified } from '../utils/execUtility';
import config from '../config/serverConfig';
import type { ProjectTree } from '../types';

export const createProjectService = async (): Promise<string> => {
  // Create a unique id and then inside the projects folder create a new folder with that id
  const projectId = uuid4();
  console.log('New project id is', projectId);

  const projectPath = path.join('./projects', projectId);
  await fs.mkdir(projectPath, { recursive: true });

  // After this call the npm create vite command in the newly created project folder
  if (!config.REACT_PROJECT_COMMAND) {
    throw new Error('REACT_PROJECT_COMMAND not configured');
  }

  try {
    await execPromisified(config.REACT_PROJECT_COMMAND, {
      cwd: projectPath
    });
  } catch (error) {
    // Clean up on failure
    await fs.rm(projectPath, { recursive: true, force: true }).catch(() => {});
    throw error;
  }

  return projectId;
};

export const getProjectTreeService = async (projectId: string): Promise<ProjectTree | null> => {
  const projectPath = path.resolve('./projects', projectId);

  // Validate projectId to prevent directory traversal
  const projectsDir = path.resolve('./projects');
  if (!projectPath.startsWith(projectsDir)) {
    throw new Error('Invalid project path');
  }

  const tree = directoryTree(projectPath);
  return tree;
};
