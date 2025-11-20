import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '../config/upload';
import ensureAuthenticated from '../middlewares/auth.middleware';
import VeiculosController from '../controller/VeiculosController';

const veiculosRoutes = Router();
const upload = multer(uploadConfig);
const veiculosController = new VeiculosController();

/**
 * @swagger
 * tags:
 *   name: Veiculos
 *   description: Endpoints para gerenciamento de veículos
 */

/**
 * @swagger
 * /api/veiculos:
 *   get:
 *     summary: Retorna uma lista de todos os veículos.
 *     tags: [Veiculos]
 *     responses:
 *       200:
 *         description: Lista de veículos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Veiculo'
 */
veiculosRoutes.get('/veiculos', veiculosController.findAll);

/**
 * @swagger
 * /api/veiculos/mais-vendidos:
 *   get:
 *     summary: Retorna os veículos mais vendidos.
 *     tags: [Veiculos]
 *     responses:
 *       200:
 *         description: Lista dos veículos mais vendidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Veiculo'
 */
veiculosRoutes.get('/veiculos/mais-vendidos', veiculosController.findMaisVendidos);

/**
 * @swagger
 * /api/veiculos/{id}:
 *   get:
 *     summary: Retorna um veículo específico pelo ID.
 *     tags: [Veiculos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do veículo.
 *     responses:
 *       200:
 *         description: Dados do veículo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Veiculo'
 *       404:
 *         description: Veículo não encontrado.
 */
veiculosRoutes.get('/veiculos/:id', veiculosController.findById);

/**
 * @swagger
 * /api/veiculos:
 *   post:
 *     summary: Cria um novo veículo.
 *     tags: [Veiculos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               preco:
 *                 type: number
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               # Adicione outras propriedades do veículo aqui
 *               imagens:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Veículo criado com sucesso.
 *       400:
 *         description: Dados inválidos.
 */
veiculosRoutes.post('/veiculos', ensureAuthenticated, upload.array('imagens', 10), veiculosController.create);

// As rotas PUT e DELETE seguiriam um padrão similar de documentação
veiculosRoutes.put('/veiculos/:id', ensureAuthenticated, veiculosController.update);
veiculosRoutes.delete('/veiculos/:id', ensureAuthenticated, veiculosController.delete);

export default veiculosRoutes;