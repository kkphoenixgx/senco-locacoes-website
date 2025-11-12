import { Router } from 'express';
import ClientesController from '../controller/ClientesController';

const clientesRoutes = Router();
const clientesController = new ClientesController();

// Rota para criar um novo cliente
clientesRoutes.post('/clientes', clientesController.create);

// Rota para login do cliente
clientesRoutes.post('/clientes/login', clientesController.login);

export default clientesRoutes;