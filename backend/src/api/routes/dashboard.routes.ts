import { Router } from 'express';
import DashboardController from '../controller/DashboardController';
import ensureAuthenticated from '../middlewares/auth.middleware';
import ensureAdmin from '../middlewares/admin.middleware';

const dashboardRoutes = Router();
const controller = new DashboardController();

dashboardRoutes.get('/dashboard/stats', ensureAuthenticated, ensureAdmin, controller.getStats);

export default dashboardRoutes;