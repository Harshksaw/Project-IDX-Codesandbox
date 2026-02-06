import type { AsyncRoute, ApiResponse } from '../types/index.js';
import {
  stopContainer,
  removeContainer,
  getContainerStatus,
  listSandboxContainers,
  cleanupStoppedContainers
} from '../containers/handleContainerCreate.js';

export const stopContainerController: AsyncRoute = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const stopped = await stopContainer(projectId);
    const response: ApiResponse = {
      success: true,
      message: stopped ? 'Container stopped successfully' : 'No container found',
      data: { stopped }
    };
    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      success: false,
      message: 'Failed to stop container',
      error: message
    });
  }
};

export const removeContainerController: AsyncRoute = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const removed = await removeContainer(projectId);
    const response: ApiResponse = {
      success: true,
      message: removed ? 'Container removed successfully' : 'No container found',
      data: { removed }
    };
    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      success: false,
      message: 'Failed to remove container',
      error: message
    });
  }
};

export const getContainerStatusController: AsyncRoute = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const status = await getContainerStatus(projectId);
    const response: ApiResponse = {
      success: true,
      message: 'Container status retrieved',
      data: status
    };
    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      success: false,
      message: 'Failed to get container status',
      error: message
    });
  }
};

export const listContainersController: AsyncRoute = async (_req, res) => {
  try {
    const containers = await listSandboxContainers();
    const response: ApiResponse = {
      success: true,
      message: 'Containers listed successfully',
      data: containers
    };
    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      success: false,
      message: 'Failed to list containers',
      error: message
    });
  }
};

export const cleanupContainersController: AsyncRoute = async (_req, res) => {
  try {
    const cleaned = await cleanupStoppedContainers();
    const response: ApiResponse = {
      success: true,
      message: `Cleaned up ${cleaned} stopped containers`,
      data: { cleaned }
    };
    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      success: false,
      message: 'Failed to cleanup containers',
      error: message
    });
  }
};
