import { Router } from 'express';
import apiRoutes from './api/routes/api.routes';

const router = Router();

router.use('/api', apiRoutes);

export default router;