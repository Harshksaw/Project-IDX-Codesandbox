import express, { Router } from 'express';
import { pingCheck } from '../../controllers/pingController.js';
import projectRouter from './projects.js';
import previewRouter from './preview.js';

const router: Router = express.Router();

router.get('/ping', pingCheck);

router.use('/projects', projectRouter);
router.use('/preview', previewRouter);

export default router;
