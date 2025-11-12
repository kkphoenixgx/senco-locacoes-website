import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '../config/upload';
import ensureAuthenticated from '../middlewares/auth.middleware';
import VeiculosController from '../controller/VeiculosController';

const veiculosRoutes = Router();
const upload = multer(uploadConfig);
const veiculosController = new VeiculosController();

// Rota para listar todos os veículos
veiculosRoutes.get('/veiculos', (_, res) => {
  // Lógica para buscar todos os veículos no repositório
  return res.json([{ id: 1, titulo: 'Carro Exemplo' }]);
});

// Rota para buscar um veículo por ID
veiculosRoutes.get('/veiculos/:id', (req, res) => {
  const { id } = req.params;
  // Lógica para buscar um veículo específico no repositório
  return res.json({ id: parseInt(id), titulo: 'Carro Exemplo' });
});

// Rota para criar um novo veículo com várias imagens
veiculosRoutes.post('/veiculos', ensureAuthenticated, upload.array('imagens', 10), veiculosController.create);

export default veiculosRoutes;