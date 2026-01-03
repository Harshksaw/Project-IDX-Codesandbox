import express, { Router } from 'express';
import v1Router from './v1/index';

const router: Router = express.Router();

router.use('/v1', v1Router);

export default router;
