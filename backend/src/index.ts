import 'dotenv/config'; // Carrega as variáveis de ambiente
import express from 'express';
import routes from './routes';
import uploadConfig from './api/config/upload';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './api/config/swagger';

export const app = express();

const port = process.env.API_PORT || 3000;

app.get('/', (_, res) => {
  res.send('Olá, mundo com Vite + Node.js + TypeScript!');
});

//? ----------- Middlewares -----------

app.use(express.json());
app.use('/files', express.static(uploadConfig.directory));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//? ----------- Routes -----------

app.use('/', routes);

//? ----------- Servidor -----------

if (process.env.NODE_ENV !== 'test') { // Evita que o servidor inicie durante testes
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}