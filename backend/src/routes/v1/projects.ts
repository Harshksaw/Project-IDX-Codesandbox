import express, { Router } from 'express';
import { createProjectController, getProjectTree } from '../../controllers/projectController';

const router: Router = express.Router();

router.post('/', createProjectController);

router.get('/:projectId/tree', getProjectTree);

export default router;
