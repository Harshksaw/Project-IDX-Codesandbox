import express, { Router } from 'express';
import { pingCheck } from '../../controllers/pingController';
import projectRouter from './projects';

const router: Router = express.Router();

router.get('/ping', pingCheck);

router.use('/projects', projectRouter);

export default router;
