import type { AsyncRoute, ApiResponse } from '../types';
import { createProjectService, getProjectTreeService } from '../service/projectService';

export const createProjectController: AsyncRoute = async (_req, res) => {
  try {
    const projectId = await createProjectService();
    const response: ApiResponse<string> = {
      success: true,
      message: 'Project created',
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
