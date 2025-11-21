import { Router } from 'express';
import PurchaseController from '../controller/PurchaseController';
import ensureAuthenticated from '../middlewares/auth.middleware';

const purchaseRoutes = Router();
const controller = new PurchaseController();

// Rota protegida para clientes autenticados fazerem uma solicitação de compra
purchaseRoutes.post('/purchase/request', ensureAuthenticated, controller.request);

export default purchaseRoutes;