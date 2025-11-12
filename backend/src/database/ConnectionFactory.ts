import mysql from 'mysql2/promise';

/**
 * Gerencia a criação e o acesso ao pool de conexões do banco de dados.
 * Utiliza o padrão Singleton para garantir que apenas um pool seja criado.
 */
export default class ConnectionFactory {
  private static pool: mysql.Pool | null = null;

  /** O construtor é privado para impedir a instanciação direta. */
  private constructor() {}

  /**
   * Cria e configura o pool de conexões com base nas variáveis de ambiente.
   */
  private static createPool(): void {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10, // Ajuste conforme a necessidade
      queueLimit: 0,
    });
  }

  /** Retorna a instância única do pool de conexões. */
  public static getPool(): mysql.Pool {
    if (!this.pool) this.createPool();
    return this.pool!;
  }
}