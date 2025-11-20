import Veiculo from "../model/items/Veiculo";
import ConnectionFactory from "../database/ConnectionFactory";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import CategoriaVeiculos from "../model/items/CategoriaVeiculos";

export default class VeiculoRepository {
  
  /** Cria um novo veículo no banco de dados e associa suas imagens. */
  public async create(veiculoData: Omit<Veiculo, 'id' | 'getAnoFormatado'>, nomesImagens: string[]): Promise<Veiculo> {
    const pool = ConnectionFactory.getPool();
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    const veiculoQuery = `
      INSERT INTO veiculos (titulo, preco, descricao, categoria_id, modelo, marca, ano_fabricacao, ano_modelo, quilometragem, cor, documentacao, revisoes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      const [result] = await connection.execute<ResultSetHeader>(
        veiculoQuery, 
        [
          veiculoData.titulo, 
          veiculoData.preco, 
          veiculoData.descricao, 
          veiculoData.categoriaId,
          veiculoData.modelo, 
          veiculoData.marca,
          veiculoData.anoFabricacao, 
          veiculoData.anoModelo, 
          veiculoData.quilometragem,
          veiculoData.cor, 
          veiculoData.documentacao, 
          veiculoData.revisoes
        ]
      );
      const veiculoId = result.insertId;

      // ----------- Imagens -----------

      const imagemQuery = 'INSERT INTO veiculo_imagens (veiculo_id, caminho_imagem) VALUES ?';
      const imagensValues = nomesImagens.map(nome => [veiculoId, nome]);
      await connection.query(imagemQuery, [imagensValues]);

      // ----------- Categoria -----------

      const [categoriaRows] = await connection.execute<RowDataPacket[]>('SELECT * FROM categoria_veiculos WHERE id = ?', [veiculoData.categoriaId]);
      const categoriaData = categoriaRows[0];
      const categoria = new CategoriaVeiculos(categoriaData.id, categoriaData.nome, categoriaData.descricao);

      // ----------- Resolve -----------

      await connection.commit();

      return new Veiculo(
        veiculoId,
        veiculoData.titulo,
        veiculoData.preco,
        veiculoData.descricao,
        nomesImagens,
        veiculoData.categoriaId,
        veiculoData.modelo,
        veiculoData.marca,
        veiculoData.anoFabricacao,
        veiculoData.anoModelo,
        veiculoData.quilometragem,
        veiculoData.cor,
        veiculoData.documentacao,
        veiculoData.revisoes,
        categoria
      );
    } 
    catch (error) {
      await connection.rollback();
      console.error('Erro ao criar veículo:', error);
      throw new Error('Erro ao salvar veículo no banco de dados.');
    }
    finally { connection.release(); }
  }

  /** Busca todos os veículos no banco de dados. */
  public async findAll(): Promise<Veiculo[]> {
    const pool = ConnectionFactory.getPool();
    const query = `
      SELECT 
        v.*,
        c.nome as categoria_nome,
        c.descricao as categoria_descricao,
        (SELECT GROUP_CONCAT(vi.caminho_imagem) FROM veiculo_imagens vi WHERE vi.veiculo_id = v.id) as imagens
      FROM veiculos v
      JOIN categoria_veiculos c ON v.categoria_id = c.id
    `;

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(query);
      
      return rows.map(row => {
        const categoria = new CategoriaVeiculos(row.categoria_id, row.categoria_nome, row.categoria_descricao);
        const imagens = row.imagens ? row.imagens.split(',') : [];

        return new Veiculo(
          row.id,
          row.titulo,
          row.preco,
          row.descricao,
          imagens,
          row.categoria_id,
          row.modelo,
          row.marca,
          row.ano_fabricacao,
          row.ano_modelo,
          row.quilometragem,
          row.cor,
          row.documentacao,
          row.revisoes,
          categoria
        );
      });
    } catch (error) {
      console.error('Erro ao buscar todos os veículos:', error);
      throw new Error('Erro ao buscar veículos no banco de dados.');
    }
  }

  /** Busca os veículos mais vendidos, ordenados pela quantidade de vendas. */
  public async findMaisVendidos(limit: number = 10): Promise<Veiculo[]> {
    const pool = ConnectionFactory.getPool();
    const query = `
      SELECT 
        v.*,
        c.nome as categoria_nome,
        c.descricao as categoria_descricao,
        (SELECT GROUP_CONCAT(vi.caminho_imagem) FROM veiculo_imagens vi WHERE vi.veiculo_id = v.id) as imagens,
        COUNT(itens.veiculo_id) as total_vendas
      FROM veiculos v
      JOIN categoria_veiculos c ON v.categoria_id = c.id
      LEFT JOIN venda_itens itens ON v.id = itens.veiculo_id
      GROUP BY v.id
      ORDER BY total_vendas DESC
      LIMIT ?
    `;

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(query, [limit]);
      return rows.map(row => {
        const categoria = new CategoriaVeiculos(row.categoria_id, row.categoria_nome, row.categoria_descricao);
        const imagens = row.imagens ? row.imagens.split(',') : [];

        return new Veiculo(
          row.id, row.titulo, row.preco, row.descricao, imagens,
          row.categoria_id, row.modelo, row.marca, row.ano_fabricacao,
          row.ano_modelo, row.quilometragem, row.cor, row.documentacao,
          row.revisoes, categoria
        );
      });
    } catch (error) {
      console.error('Erro ao buscar veículos mais vendidos:', error);
      throw new Error('Erro ao buscar veículos mais vendidos no banco de dados.');
    }
  }

  /** Busca um veículo específico pelo seu ID. */
  public async findById(id: number): Promise<Veiculo | null> {
    const pool = ConnectionFactory.getPool();
    const query = `
      SELECT 
        v.*,
        c.nome as categoria_nome,
        c.descricao as categoria_descricao,
        (SELECT GROUP_CONCAT(vi.caminho_imagem) FROM veiculo_imagens vi WHERE vi.veiculo_id = v.id) as imagens
      FROM veiculos v
      JOIN categoria_veiculos c ON v.categoria_id = c.id
      WHERE v.id = ?
    `;

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      const categoria = new CategoriaVeiculos(row.categoria_id, row.categoria_nome, row.categoria_descricao);
      const imagens = row.imagens ? row.imagens.split(',') : [];

      return new Veiculo(
        row.id,
        row.titulo,
        row.preco,
        row.descricao,
        imagens,
        row.categoria_id,
        row.modelo,
        row.marca,
        row.ano_fabricacao,
        row.ano_modelo,
        row.quilometragem,
        row.cor,
        row.documentacao,
        row.revisoes,
        categoria
      );
    } catch (error) {
      console.error(`Erro ao buscar veículo com ID ${id}:`, error);
      throw new Error('Erro ao buscar veículo no banco de dados.');
    }
  }

  /** Atualiza os dados de um veículo. */
  public async update(id: number, veiculoData: Partial<Omit<Veiculo, 'id' | 'getAnoFormatado'>>): Promise<Veiculo | null> {
    const pool = ConnectionFactory.getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const camposParaAtualizar = Object.keys(veiculoData)
        .filter(key => key !== 'imagens' && (veiculoData as any)[key] !== undefined)
        .map(key => `${key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)} = ?`)
        .join(', ');

      if (camposParaAtualizar.length > 0) {
        const valores = Object.entries(veiculoData)
          .filter(([key, value]) => key !== 'imagens' && value !== undefined)
          .map(([, value]) => value);

        const updateQuery = `UPDATE veiculos SET ${camposParaAtualizar} WHERE id = ?`;
        await connection.execute(updateQuery, [...valores, id]);
      }

      // A lógica para atualizar imagens seria mais complexa (ex: remover antigas, adicionar novas)
      // e foi omitida para simplificar.

      await connection.commit();

      return this.findById(id);

    } catch (error) {
      await connection.rollback();
      console.error(`Erro ao atualizar veículo com ID ${id}:`, error);
      throw new Error('Erro ao atualizar veículo no banco de dados.');
    } finally {
      connection.release();
    }
  }

  /** Deleta um veículo do banco de dados. */
  public async delete(id: number): Promise<boolean> {
    const pool = ConnectionFactory.getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // As imagens são deletadas em cascata (ON DELETE CASCADE)
      const [result] = await connection.execute<ResultSetHeader>('DELETE FROM veiculos WHERE id = ?', [id]);
      
      await connection.commit();

      return result.affectedRows > 0;

    } catch (error) {
      await connection.rollback();
      console.error(`Erro ao deletar veículo com ID ${id}:`, error);
      throw new Error('Erro ao deletar veículo no banco de dados.');
    } finally {
      connection.release();
    }
  }
}