import express, { Router, Request, Response, NextFunction } from 'express';
import { getContainerPort } from '../../containers/handleContainerCreate.js';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router: Router = express.Router();

// Determine the host to use for container access
const getContainerHost = () => {
  // If running in Docker (backend container), need to access host network
  if (process.env.DOCKER_ENVIRONMENT === 'true') {
    // Use Docker bridge gateway IP for Linux or specified host IP
    return process.env.DOCKER_HOST_IP || 'host.docker.internal';
  }
  // In development on host machine, use localhost
  return 'localhost';
};

// Proxy requests to the container based on projectId
router.use('/:projectId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const port = await getContainerPort(projectId);
    
    if (!port) {
      return res.status(404).json({
        success: false,
        message: 'Container not running or port not available'
      });
    }

    const containerHost = getContainerHost();
    console.log(`Proxying request to ${containerHost}:${port} for project ${projectId}`);

    // Create a proxy middleware dynamically for this request
    const proxy = createProxyMiddleware({
      target: `http://${containerHost}:${port}`,
      changeOrigin: true,
      ws: true,
      pathRewrite: (path) => {
        // Remove /api/v1/preview/:projectId from the path
        const newPath = path.replace(`/api/v1/preview/${projectId}`, '');
        console.log(`Path rewrite: ${path} -> ${newPath || '/'}`);
        return newPath || '/';
      }
    });

    return proxy(req, res, next);
  } catch (error) {
    console.error('Error in preview proxy:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

export default router;
