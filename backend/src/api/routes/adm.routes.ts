import { Router } from 'express';
import AdmsController from '../controller/AdmsController';

const admRoutes = Router();
const admsController = new AdmsController();

/**
 * @swagger
 * /api/adms/login:
 *   post:
 *     summary: Realiza o login de um administrador.
 *     tags: [Administradores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login bem-sucedido, retorna um token de autenticação.
 *       401:
 *         description: Email ou senha incorretos.
 */
admRoutes.post('/adms/login', admsController.login);

export default admRoutes;