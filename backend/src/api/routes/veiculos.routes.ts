import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '../upload';

// Supondo que você terá um repositório para lidar com a lógica do banco de dados
// import VeiculosRepository from '../repository/VeiculosRepository';

const veiculosRoutes = Router();
const upload = multer(uploadConfig);

// Exemplo de rota para fazer upload de uma imagem para um veículo específico
veiculosRoutes.post('/veiculos/:id/imagens', upload.single('imagem'), (req, res) => {
  console.log(req.file); // Informações do arquivo salvo pelo multer

  // Lógica a ser implementada:
  // 1. Instanciar o VeiculosRepository.
  // 2. Chamar um método como `adicionarImagem(id, req.file.filename)`.
  // 3. Esse método salvaria o `req.file.filename` no array de imagens do veículo no banco.
  return res.json({ message: `Imagem ${req.file?.filename} recebida!` });
});

export default veiculosRoutes;