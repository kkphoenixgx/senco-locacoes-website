import 'dotenv/config'; // Carrega as variáveis de ambiente
import express from 'express';
// import admRoutes from './api/routes/Adm.routes';
import veiculosRoutes from './api/routes/veiculos.routes';

export const app = express();

const port = process.env.API_PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Olá, mundo com Vite + Node.js + TypeScript!');
});

// app.use('/api', admRoutes);
app.use('/api', veiculosRoutes);

if (process.env.NODE_ENV !== 'test') { // Evita que o servidor inicie durante testes
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}