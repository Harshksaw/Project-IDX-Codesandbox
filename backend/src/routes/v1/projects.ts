import express, { Router } from 'express';
import {
  createProjectController,
  getProjectTree,
  getProjectMetadata,
  listProjects,
  deleteProject,
  getAvailableFrameworksController
} from '../../controllers/projectController.js';

const router: Router = express.Router();

// Framework endpoints
router.get('/frameworks/available', getAvailableFrameworksController);

// Project CRUD endpoints
router.post('/', createProjectController);
router.get('/', listProjects);
router.get('/:projectId/metadata', getProjectMetadata);
router.get('/:projectId/tree', getProjectTree);
router.delete('/:projectId', deleteProject);

export default router;

