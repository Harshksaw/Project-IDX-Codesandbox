import express, { Router } from 'express';
import {
  stopContainerController,
  removeContainerController,
  getContainerStatusController,
  listContainersController,
  cleanupContainersController
} from '../../controllers/containerController.js';

const router: Router = express.Router();

// List all sandbox containers
router.get('/', listContainersController);

// Cleanup all stopped containers
router.post('/cleanup', cleanupContainersController);

// Container operations by project ID
router.get('/:projectId/status', getContainerStatusController);
router.post('/:projectId/stop', stopContainerController);
router.delete('/:projectId', removeContainerController);

export default router;
