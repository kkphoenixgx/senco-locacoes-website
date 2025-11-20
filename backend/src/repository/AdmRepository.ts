import Adm, { IADMDto } from "../model/Adm";
import ConnectionFactory from "../database/ConnectionFactory";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export default class AdmRepository {

  /** Cria um novo administrador no banco de dados. */
  public async create(adm: Adm): Promise<Adm> {
    const pool = ConnectionFactory.getPool();
    const query = 'INSERT INTO adms (email, senha_hash) VALUES (?, ?)';

    try {
      const [result] = await pool.execute<ResultSetHeader>(query, [adm.email, adm.senhaHash]);
      
      if (result.insertId) {
        return adm; // Retorna o adm criado, já que o ID não é gerenciado pelo modelo Adm
      } else {
        throw new Error('Não foi possível criar o administrador.');
      }
    } catch (error) {
      console.error('Erro ao criar administrador:', error);
      // Tratar erro de email duplicado, se necessário
      if (error instanceof Error && error.message.includes('Duplicate entry')) {
        throw new Error('O email fornecido já está em uso.');
      }
      throw new Error('Erro ao salvar administrador no banco de dados.');
    }
  }

  /** Busca um administrador pelo email. */
  public async findByEmail(email: string): Promise<Adm | null> {
    const pool = ConnectionFactory.getPool();

    const query = 'SELECT * FROM adms WHERE email = ?';

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(query, [email]);

      if (rows.length === 0) return null;

      const rowData = rows[0];

      if (!rowData || typeof rowData.email !== 'string' || typeof rowData.senha_hash !== 'string') {
        console.error('Dados do administrador inválidos recebidos do banco de dados:', rowData);
        throw new Error('Formato de dados do administrador inválido no banco de dados.');
      }

      return Adm.fromDB(rowData as IADMDto);

    } 
    catch (error) {
      console.error('Erro ao buscar administrador por email:', error);
      throw new Error('Erro ao acessar o banco de dados.');
    }
  }

  /** Atualiza a senha de um administrador. */
  public async update(email: string, admData: Partial<Adm>): Promise<Adm | null> {
    const pool = ConnectionFactory.getPool();
    
    // Por enquanto, apenas a atualização de senha é suportada
    if (!admData.senhaHash) {
      throw new Error("Apenas a atualização de senha é suportada.");
    }

    const query = 'UPDATE adms SET senha_hash = ? WHERE email = ?';

    try {
      const [result] = await pool.execute<ResultSetHeader>(query, [admData.senhaHash, email]);

      if (result.affectedRows > 0) {
        return this.findByEmail(email);
      }
      return null;

    } catch (error) {
      console.error(`Erro ao atualizar adm com email ${email}:`, error);
      throw new Error('Erro ao atualizar administrador no banco de dados.');
    }
  }

  /** Deleta um administrador pelo email. */
  public async delete(email: string): Promise<boolean> {
    const pool = ConnectionFactory.getPool();
    const query = 'DELETE FROM adms WHERE email = ?';

    try {
      const [result] = await pool.execute<ResultSetHeader>(query, [email]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Erro ao deletar adm com email ${email}:`, error);
      throw new Error('Erro ao deletar administrador no banco de dados.');
    }
  }
}