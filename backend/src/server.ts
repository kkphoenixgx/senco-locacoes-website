import 'dotenv/config';
import { viteNodeApp } from './index'; // Importa a app Express configurada
import ConnectionFactory from './database/ConnectionFactory';

const port = process.env.API_PORT || 3000;

async function startProductionServer() {
  try {
    const pool = ConnectionFactory.getPool(); 
    const connection = await pool.getConnection();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    connection.release();

    viteNodeApp.listen(port, () => {
      console.log(`🚀 Servidor de produção rodando em http://localhost:${port}`);
      console.log(`📄 Documentação da API disponível em http://localhost:${port}/api-docs`);
    });
  } catch (error: any) {
    console.error('❌ Falha ao conectar com o banco de dados.');
    console.error(`   Erro: ${error.message}`);
    process.exit(1);
  }
}

startProductionServer();