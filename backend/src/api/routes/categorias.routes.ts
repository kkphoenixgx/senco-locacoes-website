import { Router } from 'express';
import CategoriaVeiculosController from '../controller/CategoriaVeiculosController';
import ensureAuthenticated from '../middlewares/auth.middleware';
import ensureAdmin from '../middlewares/admin.middleware';

const categoriasRoutes = Router();
const controller = new CategoriaVeiculosController();

// Rota pública para buscar todas as categorias (usada no formulário de veículos)
categoriasRoutes.get('/categorias', controller.findAll);

// Rotas protegidas para administradores
categoriasRoutes.post('/categorias', ensureAuthenticated, ensureAdmin, controller.create);
categoriasRoutes.put('/categorias/:id', ensureAuthenticated, ensureAdmin, controller.update);
categoriasRoutes.delete('/categorias/:id', ensureAuthenticated, ensureAdmin, controller.delete);

export default categoriasRoutes;