import { Router } from 'express';
import ClientesController from '../controller/ClientesController';
import ensureAuthenticated from '../middlewares/auth.middleware';
import ensureAdmin from '../middlewares/admin.middleware';

const clientesRoutes = Router();
const clientesController = new ClientesController();

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Endpoints para autenticação e gerenciamento de clientes
 */

/**
 * @swagger
 * /api/clientes/me:
 *   get:
 *     summary: Retorna o perfil do cliente autenticado.
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do perfil do cliente.
 *       401:
 *         description: Não autenticado.
 */
clientesRoutes.get('/clientes/me', ensureAuthenticated, clientesController.getProfile);

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Retorna uma lista de todos os clientes (Apenas para Administradores).
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 *       403:
 *         description: Acesso negado.
 */
clientesRoutes.get('/clientes', ensureAuthenticated, ensureAdmin, clientesController.findAll);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Retorna um cliente específico pelo ID.
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do cliente.
 *     responses:
 *       200:
 *         description: Dados do cliente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente não encontrado.
 */
clientesRoutes.get('/clientes/:id', ensureAuthenticated, clientesController.findById);

clientesRoutes.delete('/clientes/:id', ensureAuthenticated, clientesController.delete);

export default clientesRoutes;