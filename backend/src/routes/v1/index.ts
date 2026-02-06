import express, { Router } from 'express';
import { pingCheck } from '../../controllers/pingController.js';
import projectRouter from './projects.js';
import containerRouter from './containers.js';

const router: Router = express.Router();

router.get('/ping', pingCheck);

router.use('/projects', projectRouter);
router.use('/containers', containerRouter);

export default router;
