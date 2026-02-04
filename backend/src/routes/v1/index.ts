import express, { Router } from 'express';
import { pingCheck } from '../../controllers/pingController.js';
import projectRouter from './projects.js';

const router: Router = express.Router();

router.get('/ping', pingCheck);

router.use('/projects', projectRouter);

export default router;
