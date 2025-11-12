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
      INSERT INTO veiculos (titulo, preco, descricao, categoria_id, modelo, ano_fabricacao, ano_modelo, quilometragem, cor, documentacao, revisoes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

}