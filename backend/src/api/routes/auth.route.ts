import { Router } from 'express';
import ClientesController from '../controller/ClientesController';
import ensureAuthenticated from '../middlewares/auth.middleware';

const authRoutes = Router();
const clientesController = new ClientesController();

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Endpoints para autenticação e gerenciamento de perfil de cliente
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Cria um novo cliente (registra).
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, senhaPlana]
 *             properties:
 *               nome: { type: string }
 *               email: { type: string, format: email }
 *               senhaPlana: { type: string, minLength: 6 }
 *               telefone: { type: string }
 *               endereco: { type: string }
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso. Retorna o usuário e um token JWT.
 */
authRoutes.post('/auth/register', clientesController.create);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza o login de um cliente.
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha]
 *             properties:
 *               email: { type: string, format: email }
 *               senha: { type: string }
 *     responses:
 *       200:
 *         description: Login bem-sucedido. Retorna o usuário e um token JWT.
 *       401:
 *         description: Email ou senha incorretos.
 */
authRoutes.post('/auth/login', clientesController.login);

/**
 * @swagger
 * /api/auth/me:
 *   put:
 *     summary: Atualiza o perfil do cliente autenticado.
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Dados do cliente a serem atualizados. O email não pode ser alterado.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome: { type: string }
 *               telefone: { type: string }
 *               endereco: { type: string }
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso.
 *       401:
 *         description: Não autenticado.
 */
authRoutes.put('/auth/me', ensureAuthenticated, clientesController.update);

export default authRoutes;