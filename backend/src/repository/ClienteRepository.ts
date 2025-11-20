import Cliente from "../model/Cliente";
import ConnectionFactory from "../database/ConnectionFactory";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import Encrypt from "../utils/Encrypt";

export default class ClienteRepository {

  /** Cria um novo cliente no banco de dados. */
  public async create(clienteData: Omit<Cliente, 'id' | 'isPasswordCorrect' | 'senha_hash'> & { senhaPlana: string }): Promise<Cliente> {
    const pool = ConnectionFactory.getPool();
    const query = 'INSERT INTO clientes (nome, telefone, email, senha_hash, endereco) VALUES (?, ?, ?, ?, ?)';

    try {
      // O método Cliente.create já faz o hash da senha
      const cliente = await Cliente.create(0, clienteData.nome, clienteData.telefone, clienteData.email, clienteData.senhaPlana, clienteData.endereco);

      const [result] = await pool.execute<ResultSetHeader>(query, [
        cliente.nome,
        cliente.telefone,
        cliente.email,
        cliente.senha_hash,
        cliente.endereco
      ]);

      if (result.insertId) {
        return Cliente.fromDB({ ...cliente, id: result.insertId });
      } else {
        throw new Error('Não foi possível criar o cliente.');
      }
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      if (error instanceof Error && error.message.includes('Duplicate entry')) {
        throw new Error('O email fornecido já está em uso.');
      }
      throw new Error('Erro ao salvar cliente no banco de dados.');
    }
  }

  /** Busca todos os clientes no banco de dados. */
  public async findAll(): Promise<Cliente[]> {
    const pool = ConnectionFactory.getPool();
    const query = 'SELECT * FROM clientes';

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(query);
      return rows.map(row => Cliente.fromDB(row as any));
    } catch (error) {
      console.error('Erro ao buscar todos os clientes:', error);
      throw new Error('Erro ao buscar clientes no banco de dados.');
    }
  }

  /** Busca um cliente pelo seu ID. */
  public async findById(id: number): Promise<Cliente | null> {
    const pool = ConnectionFactory.getPool();
    const query = 'SELECT * FROM clientes WHERE id = ?';

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
      if (rows.length === 0) return null;
      return Cliente.fromDB(rows[0] as any);
    } catch (error) {
      console.error(`Erro ao buscar cliente com ID ${id}:`, error);
      throw new Error('Erro ao buscar cliente no banco de dados.');
    }
  }

  /** Busca um cliente pelo seu email. */
  public async findByEmail(email: string): Promise<Cliente | null> {
    const pool = ConnectionFactory.getPool();
    const query = 'SELECT * FROM clientes WHERE email = ?';

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(query, [email]);
      if (rows.length === 0) return null;
      return Cliente.fromDB(rows[0] as any);
    } catch (error) {
      console.error(`Erro ao buscar cliente com email ${email}:`, error);
      throw new Error('Erro ao buscar cliente no banco de dados.');
    }
  }

  /** Atualiza os dados de um cliente. */
  public async update(id: number, clienteData: Partial<Omit<Cliente, 'id' | 'isPasswordCorrect'> & { senhaPlana?: string }>): Promise<Cliente | null> {
    const pool = ConnectionFactory.getPool();
    
    const camposParaAtualizar: string[] = [];
    const valores: any[] = [];

    for (const [key, value] of Object.entries(clienteData)) {
      if (value !== undefined && key !== 'senhaPlana') {
        camposParaAtualizar.push(`${key} = ?`);
        valores.push(value);
      }
    }

    if (clienteData.senhaPlana) {
      camposParaAtualizar.push('senha_hash = ?');
      valores.push(await Encrypt.hash(clienteData.senhaPlana));
    }

    if (camposParaAtualizar.length === 0) return this.findById(id);

    const query = `UPDATE clientes SET ${camposParaAtualizar.join(', ')} WHERE id = ?`;
    valores.push(id);

    try {
      await pool.execute(query, valores);
      return this.findById(id);
    } catch (error) {
      console.error(`Erro ao atualizar cliente com ID ${id}:`, error);
      throw new Error('Erro ao atualizar cliente no banco de dados.');
    }
  }

  /** Deleta um cliente do banco de dados. */
  public async delete(id: number): Promise<boolean> {
    const pool = ConnectionFactory.getPool();
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM clientes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}