import type { AsyncRoute, ApiResponse, CreateProjectRequest } from '../types/index.js';
import {
  createProjectService,
  getProjectTreeService,
  getProjectMetadataService,
  listProjectsService,
  deleteProjectService
} from '../service/projectService.js';
import { getAvailableFrameworks, FrameworkType } from '../config/frameworks.js';
import { getContainerPort } from '../containers/handleContainerCreate.js';

export const createProjectController: AsyncRoute = async (req, res) => {
  try {
    const createReq = req as unknown as CreateProjectRequest;
    const { name, framework = FrameworkType.VITE_REACT } = createReq.body;

    const projectId = await createProjectService(framework, name);
    const response: ApiResponse<string> = {
      success: true,
      message: 'Project created successfully',
      data: projectId
    };
    return res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: message
    });
  }
};

export const getProjectTree: AsyncRoute = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const tree = await getProjectTreeService(projectId);
    const response: ApiResponse = {
      data: tree,
      success: true,
      message: 'Successfully fetched the tree'
    };
    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch project tree',
      error: message
    });
  }
};

export const getProjectMetadata: AsyncRoute = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const metadata = await getProjectMetadataService(projectId);
    if (!metadata) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const response: ApiResponse = {
      data: metadata,
      success: true,
      message: 'Successfully fetched project metadata'
    };
    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch project metadata',
      error: message
    });
  }
};

export const listProjects: AsyncRoute = async (_req, res) => {
  try {
    const projects = await listProjectsService();
    const response: ApiResponse = {
      data: projects,
      success: true,
      message: 'Successfully fetched projects'
    };
    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: message
    });
  }
};

export const deleteProject: AsyncRoute = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    await deleteProjectService(projectId);
    const response: ApiResponse = {
      success: true,
      message: 'Project deleted successfully'
    };
    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: message
    });
  }
};

export const getAvailableFrameworksController: AsyncRoute = async (_req, res) => {
  try {
    const frameworks = getAvailableFrameworks();
    const response: ApiResponse = {
      data: frameworks,
      success: true,
      message: 'Successfully fetched available frameworks'
    };
    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch frameworks',
      error: message
    });
  }
};

export const getProjectPort: AsyncRoute = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const port = await getContainerPort(projectId);
    
    if (!port) {
      return res.status(404).json({
        success: false,
        message: 'Container not running or port not available'
      });
    }

    const response: ApiResponse = {
      data: { port },
      success: true,
      message: 'Successfully fetched container port'
    };
    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch container port',
      error: message
    });
  }
};

