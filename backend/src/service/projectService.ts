import uuid4 from 'uuid4';
import { promises as fs } from 'fs';
import path from 'path';
import directoryTree from 'directory-tree';
import { execPromisified } from '../utils/execUtility';
import config from '../config/serverConfig';
import type { ProjectTree, Project } from '../types';
import { getFrameworkConfig, FrameworkType } from '../config/frameworks';

export const createProjectService = async (
  framework: FrameworkType = FrameworkType.VITE_REACT,
  projectName?: string
): Promise<string> => {
  // Create a unique id and then inside the projects folder create a new folder with that id
  const projectId = uuid4();
  const displayName = projectName || `${framework}-${projectId.substring(0, 8)}`;
  
  console.log(`Creating new project: ${displayName} (${framework})`);

  const projectPath = path.join('./projects', projectId);
  await fs.mkdir(projectPath, { recursive: true });

  try {
    // Get framework config
    const frameworkConfig = getFrameworkConfig(framework);
    
    // Initialize the project with the framework's init command
    console.log(`Executing: ${frameworkConfig.initCommand}`);
    await execPromisified(frameworkConfig.initCommand, {
      cwd: projectPath
    });

    // Create project metadata file
    const projectMetadata: Project = {
      id: projectId,
      name: displayName,
      framework,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        packageManager: frameworkConfig.packageManager,
        nodeVersion: 'v18.0.0'
      }
    };

    await fs.writeFile(
      path.join(projectPath, '.project.json'),
      JSON.stringify(projectMetadata, null, 2)
    );

    return projectId;
  } catch (error) {
    // Clean up on failure
    await fs.rm(projectPath, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
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

export const getProjectMetadataService = async (projectId: string): Promise<Project | null> => {
  try {
    const projectPath = path.resolve('./projects', projectId);
    const projectsDir = path.resolve('./projects');
    
    if (!projectPath.startsWith(projectsDir)) {
      throw new Error('Invalid project path');
    }

    const metadataPath = path.join(projectPath, '.project.json');
    const data = await fs.readFile(metadataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to read project metadata for ${projectId}:`, error);
    return null;
  }
};

export const listProjectsService = async (): Promise<Project[]> => {
  try {
    const projectsDir = './projects';
    const projectIds = await fs.readdir(projectsDir);
    
    const projects: Project[] = [];
    for (const projectId of projectIds) {
      const metadata = await getProjectMetadataService(projectId);
      if (metadata) {
        projects.push(metadata);
      }
    }
    
    return projects.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Failed to list projects:', error);
    return [];
  }
};

export const deleteProjectService = async (projectId: string): Promise<void> => {
  const projectPath = path.resolve('./projects', projectId);
  const projectsDir = path.resolve('./projects');
  
  if (!projectPath.startsWith(projectsDir)) {
    throw new Error('Invalid project path');
  }

  await fs.rm(projectPath, { recursive: true, force: true });
  console.log(`Project ${projectId} deleted`);
};

