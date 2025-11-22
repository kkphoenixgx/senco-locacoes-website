import mysql from 'mysql2/promise';

/**
 * Gerencia a criação e o acesso ao pool de conexões do banco de dados.
 * Utiliza o padrão Singleton para garantir que apenas um pool seja criado.
 */
export default class ConnectionFactory {
  private static pool: mysql.Pool | null = null;

  private constructor() {}

  /**
   * Retorna a instância única do pool de conexões, criando-a se ainda não existir.
   * Este é o único ponto de acesso ao pool, garantindo o padrão Singleton.
   */
  public static getPool(): mysql.Pool {
    if (!this.pool) {
      // A criação do pool é feita aqui, garantindo que as variáveis de ambiente
      // já foram carregadas pelo 'dotenv/config' no ponto de entrada da aplicação.
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    }
    return this.pool!;
  }
}