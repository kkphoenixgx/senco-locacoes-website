import { Router } from 'express';

const admRoutes = Router();

admRoutes.get('/adms', (req, res) => {
  // Em um caso real, você chamaria seu AdmRepository aqui para buscar os dados do banco.
  console.log('Acessando a rota de administradores!');
  return res.json([{ id: 1, name: 'Admin Exemplo' }]);
});

export default admRoutes;