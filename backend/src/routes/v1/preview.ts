import express, { Router, Request, Response } from 'express';
import { getContainerPort } from '../../containers/handleContainerCreate.js';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router: Router = express.Router();

// Proxy requests to the container based on projectId
router.use('/:projectId/*', async (req: Request, res: Response, next) => {
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

    // Create a proxy middleware dynamically for this request
    const proxy = createProxyMiddleware({
      target: `http://localhost:${port}`,
      changeOrigin: true,
      ws: true,
      pathRewrite: (path) => {
        // Remove /api/v1/preview/:projectId from the path
        return path.replace(`/api/v1/preview/${projectId}`, '');
      }
    });

    return proxy(req, res, next);
  } catch (error) {
    console.error('Error in preview proxy:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
