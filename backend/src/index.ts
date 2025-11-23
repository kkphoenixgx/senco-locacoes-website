import 'dotenv/config'; // Carrega as variáveis de ambiente
import express from 'express';
import cors from 'cors';
import routes from './routes';
import uploadConfig from './api/config/upload';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './api/middlewares/swagger';

export const viteNodeApp = express();

const port = process.env.API_PORT || 3000;

viteNodeApp.get('/', (_, res) => {
  res.send('Olá, mundo com Vite + Node.js + TypeScript!');
});

//? ----------- Middlewares -----------

viteNodeApp.use(cors());
viteNodeApp.use(express.json());
viteNodeApp.use('/files', express.static(uploadConfig.directory));
viteNodeApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//? ----------- Routes -----------

viteNodeApp.use('/', routes);

//? ----------- Servidor -----------

// Em ambiente de desenvolvimento, o vite-plugin-node gerencia o servidor.
// Em produção, o arquivo 'server.ts' cuidará disso.
if (process.env.NODE_ENV !== 'test') {
  viteNodeApp.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  });
}