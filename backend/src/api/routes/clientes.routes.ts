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
 * /api/clientes:
 *   post:
 *     summary: Cria um novo cliente.
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, senhaPlana]
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senhaPlana:
 *                 type: string
 *               telefone:
 *                 type: string
 *               endereco:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso, retorna o usuário e um token JWT.
 */
clientesRoutes.post('/clientes', clientesController.create);

/**
 * @swagger
 * /api/clientes/login:
 *   post:
 *     summary: Realiza o login de um cliente.
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha]
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login bem-sucedido, retorna o usuário e um token JWT.
 *       401:
 *         description: Email ou senha incorretos.
 */
clientesRoutes.post('/clientes/login', clientesController.login);

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

// As rotas PUT e DELETE seguiriam um padrão similar de documentação
clientesRoutes.put('/clientes/:id', ensureAuthenticated, clientesController.update);
clientesRoutes.delete('/clientes/:id', ensureAuthenticated, clientesController.delete);

export default clientesRoutes;