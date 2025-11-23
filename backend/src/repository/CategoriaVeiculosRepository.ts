import { ResultSetHeader, RowDataPacket } from "mysql2";
import ConnectionFactory from "../database/ConnectionFactory";
import CategoriaVeiculos from "../model/items/CategoriaVeiculos";

export default class CategoriaVeiculosRepository {
  private pool = ConnectionFactory.getPool();

  /** Busca todas as categorias de veículos. */
  public async findAll(): Promise<CategoriaVeiculos[]> {
    const [rows] = await this.pool.execute<RowDataPacket[]>('SELECT * FROM categoria_veiculos ORDER BY nome');
    return rows.map(row => new CategoriaVeiculos(row.id, row.nome, row.descricao));
  }

  /** Busca uma categoria pelo ID. */
  public async findById(id: number): Promise<CategoriaVeiculos | null> {
    const [rows] = await this.pool.execute<RowDataPacket[]>('SELECT * FROM categoria_veiculos WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return new CategoriaVeiculos(row.id, row.nome, row.descricao);
  }

  /** Cria uma nova categoria. */
  public async create(categoria: Omit<CategoriaVeiculos, 'id'>): Promise<CategoriaVeiculos> {
    const query = 'INSERT INTO categoria_veiculos (nome, descricao) VALUES (?, ?)';
    const [result] = await this.pool.execute<ResultSetHeader>(query, [categoria.nome, categoria.descricao]);
    
    if (result.insertId) {
      return new CategoriaVeiculos(result.insertId, categoria.nome, categoria.descricao);
    }
    throw new Error("Não foi possível criar a categoria.");
  }

  /** Atualiza uma categoria existente. */
  public async update(id: number, categoriaData: Partial<CategoriaVeiculos>): Promise<CategoriaVeiculos | null> {
    const camposParaAtualizar = Object.keys(categoriaData)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`)
      .join(', ');

    if (camposParaAtualizar.length === 0) {
      return this.findById(id);
    }

    const valores = Object.entries(categoriaData)
      .filter(([key]) => key !== 'id')
      .map(([, value]) => value);

    const query = `UPDATE categoria_veiculos SET ${camposParaAtualizar} WHERE id = ?`;
    
    try {
      await this.pool.execute(query, [...valores, id]);
      return this.findById(id);
    } catch (error) {
      console.error(`Erro ao atualizar categoria com ID ${id}:`, error);
      throw new Error('Erro ao atualizar categoria no banco de dados.');
    }
  }

  /** Deleta uma categoria. */
  public async delete(id: number): Promise<boolean> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      // Verifica se a categoria está em uso
      const [veiculos] = await connection.execute<RowDataPacket[]>('SELECT id FROM veiculos WHERE categoria_id = ? LIMIT 1', [id]);
      if (veiculos.length > 0) {
        throw new Error('Não é possível excluir a categoria, pois ela está associada a um ou mais veículos.');
      }

      const [result] = await connection.execute<ResultSetHeader>('DELETE FROM categoria_veiculos WHERE id = ?', [id]);
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.error(`Erro ao deletar categoria com ID ${id}:`, error);
      // Repassa a mensagem de erro específica para o controller
      if (error instanceof Error) throw error;
      throw new Error('Erro ao deletar categoria no banco de dados.');
    } finally {
      connection.release();
    }
  }
}