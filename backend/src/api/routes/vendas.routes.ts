import { Router } from 'express';
import VendasController from '../controller/VendasController';
import ensureAuthenticated from '../middlewares/auth.middleware';

import ensureAdmin from '../middlewares/admin.middleware';
const vendasRoutes = Router();
const vendasController = new VendasController();

/**
 * @swagger
 * tags:
 *   name: Vendas
 *   description: Endpoints para gerenciamento de vendas
 */

/**
 * @swagger
 * /api/vendas:
 *   post:
 *     summary: Cria uma nova venda.
 *     tags: [Vendas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *               precoTotal:
 *                 type: number
 *     responses:
 *       201:
 *         description: Venda criada com sucesso.
 */
vendasRoutes.post('/vendas', ensureAuthenticated, vendasController.create);

/**
 * @swagger
 * /api/vendas:
 *   get:
 *     summary: Retorna a lista de vendas do usuário logado.
 *     tags: [Vendas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vendas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Venda'
 */
vendasRoutes.get('/vendas', ensureAuthenticated, vendasController.findAll);

/**
 * @swagger
 * /api/vendas/{id}:
 *   get:
 *     summary: Retorna uma venda específica pelo ID.
 *     tags: [Vendas]
 *     security:
 *       - bearerAuth: []
 *     # ... (parâmetros e respostas similares ao GET de Veículo por ID)
 */
vendasRoutes.get('/vendas/:id', ensureAuthenticated, ensureAdmin, vendasController.findById);

/**
 * @swagger
 * /api/vendas/{id}:
 *   delete:
 *     summary: Deleta uma venda.
 *     tags: [Vendas]
 *     security:
 *       - bearerAuth: []
 *     # ... (parâmetros e respostas similares ao DELETE de Veículo por ID)
 */
vendasRoutes.delete('/vendas/:id', ensureAuthenticated, ensureAdmin, vendasController.delete);

/**
 * @swagger
 * /api/vendas/{id}/status:
 *   put:
 *     summary: Atualiza o status de efetivação de uma venda.
 *     tags: [Vendas]
 *     security:
 *       - bearerAuth: []
 *     # ... (parâmetros e respostas)
 */
vendasRoutes.put('/vendas/:id/status', ensureAuthenticated, ensureAdmin, vendasController.updateStatus);


export default vendasRoutes;