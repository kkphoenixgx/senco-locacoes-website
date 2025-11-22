import { ResultSetHeader, RowDataPacket } from "mysql2";
import ConnectionFactory from "../database/ConnectionFactory";
import Venda from "../model/Venda";
import ClienteRepository from "./ClienteRepository";
import VeiculoRepository from "./VeiculoRepository";
import Veiculo from "../model/items/Veiculo";
import Cliente from "../model/Cliente";

export default class VendaRepository {
  private clienteRepository: ClienteRepository;
  private veiculoRepository: VeiculoRepository;

  constructor() {
    this.clienteRepository = new ClienteRepository();
    this.veiculoRepository = new VeiculoRepository();
  }

  public async create(vendaData: Omit<Venda, 'id' | 'cliente' | 'getPrecoTotalFormatado'>): Promise<Venda | null> {
    const pool = ConnectionFactory.getPool();
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const vendaQuery = 'INSERT INTO vendas (data_venda, preco_total, cliente_id) VALUES (?, ?, ?)';
      const [vendaResult] = await connection.execute<ResultSetHeader>(vendaQuery, [
        vendaData.dataVenda,
        vendaData.precoTotal,
        vendaData.clienteId
      ]);
      const vendaId = vendaResult.insertId;

      const itensQuery = 'INSERT INTO venda_itens (venda_id, veiculo_id) VALUES ?';
      const itensValues = vendaData.items.map(item => [vendaId, item.id]);
      await connection.query(itensQuery, [itensValues]);

      await connection.commit();

      return this.findById(vendaId);

    } catch (error) {
      await connection.rollback();
      console.error('Erro ao criar venda:', error);
      throw new Error('Erro ao salvar venda no banco de dados.');
    } finally {
      connection.release();
    }
  }

  /** Busca uma venda pelo seu ID. */
  public async findById(id: number): Promise<Venda | null> {
    const pool = ConnectionFactory.getPool();
    const query = `
      SELECT
        v.id as venda_id, v.data_venda, v.preco_total,
        c.id as cliente_id, c.nome as cliente_nome, c.telefone as cliente_telefone, c.email as cliente_email, c.endereco as cliente_endereco, c.senha_hash,
        ve.id as veiculo_id, ve.titulo, ve.preco, ve.descricao, ve.modelo, ve.marca, ve.ano_fabricacao, ve.ano_modelo, ve.quilometragem, ve.cor, ve.documentacao, ve.revisoes,
        (SELECT GROUP_CONCAT(vi.caminho_imagem) FROM veiculo_imagens vi WHERE vi.veiculo_id = ve.id) as imagens
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      JOIN venda_itens vi ON v.id = vi.venda_id
      JOIN veiculos ve ON vi.veiculo_id = ve.id
      WHERE v.id = ?
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    if (rows.length === 0) return null;

    const clienteData = rows[0];
    const cliente = Cliente.fromDB({
      id: clienteData.cliente_id,
      nome: clienteData.cliente_nome,
      telefone: clienteData.cliente_telefone,
      email: clienteData.cliente_email,
      endereco: clienteData.cliente_endereco,
      senha_hash: clienteData.senha_hash
    });

    const veiculosVendidos = rows.map(row => new Veiculo(
      row.veiculo_id,
      row.titulo,
      row.preco,
      row.descricao,
      row.imagens ? row.imagens.split(',') : [],
      0,
      row.modelo,
      row.marca,
      row.ano_fabricacao,
      row.ano_modelo,
      row.quilometragem,
      row.cor,
      row.documentacao,
      row.revisoes
    ));

    return new Venda(
      rows[0].venda_id,
      veiculosVendidos,
      new Date(rows[0].data_venda),
      parseFloat(rows[0].preco_total),
      rows[0].cliente_id,
      cliente
    );
  }

  /** Busca todas as vendas. */
  public async findAll(): Promise<Venda[]> {
    const pool = ConnectionFactory.getPool();
    // Consulta otimizada para buscar tudo de uma vez
    const query = `
      SELECT
        v.id as venda_id, v.data_venda, v.preco_total,
        c.id as cliente_id, c.nome as cliente_nome, c.telefone as cliente_telefone, c.email as cliente_email, c.endereco as cliente_endereco, c.senha_hash,
        ve.id as veiculo_id, ve.titulo, ve.preco, ve.descricao, ve.modelo, ve.marca, ve.ano_fabricacao, ve.ano_modelo, ve.quilometragem, ve.cor, ve.documentacao, ve.revisoes,
        (SELECT GROUP_CONCAT(vi.caminho_imagem) FROM veiculo_imagens vi WHERE vi.veiculo_id = ve.id) as imagens
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      JOIN venda_itens vi ON v.id = vi.venda_id
      JOIN veiculos ve ON vi.veiculo_id = ve.id
      ORDER BY v.data_venda DESC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query);

    // Agrupa os resultados por venda_id
    const vendasMap = new Map<number, { vendaData: RowDataPacket, cliente: Cliente, veiculos: Veiculo[] }>();

    for (const row of rows) {
      if (!vendasMap.has(row.venda_id)) {
        const cliente = Cliente.fromDB({
          id: row.cliente_id, nome: row.cliente_nome, telefone: row.cliente_telefone,
          email: row.cliente_email, endereco: row.cliente_endereco, senha_hash: row.senha_hash
        });
        vendasMap.set(row.venda_id, { vendaData: row, cliente, veiculos: [] });
      }

      const veiculo = new Veiculo(
        row.veiculo_id, row.titulo, row.preco, row.descricao,
        row.imagens ? row.imagens.split(',') : [], 0, row.modelo, row.marca,
        row.ano_fabricacao, row.ano_modelo, row.quilometragem, row.cor,
        row.documentacao, row.revisoes
      );
      vendasMap.get(row.venda_id)!.veiculos.push(veiculo);
    }

    // Constrói os objetos Venda a partir do mapa
    const vendas: Venda[] = [];
    for (const [vendaId, data] of vendasMap.entries()) {
      vendas.push(new Venda(
        vendaId, data.veiculos, new Date(data.vendaData.data_venda),
        parseFloat(data.vendaData.preco_total), data.vendaData.cliente_id, data.cliente
      ));
    }

    return vendas;
  }

  /**
   * Atualiza dados de uma venda.
   * Nota: A atualização de itens é uma operação complexa e não está implementada.
   * Apenas data, preço total e cliente podem ser atualizados.
   */
  public async update(id: number, vendaData: Partial<Pick<Venda, 'dataVenda' | 'precoTotal' | 'clienteId'>>): Promise<Venda | null> {
    const pool = ConnectionFactory.getPool();
    
    const camposParaAtualizar = Object.keys(vendaData)
      .map(key => `${key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)} = ?`)
      .join(', ');

    if (camposParaAtualizar.length === 0) return this.findById(id);

    const valores = Object.values(vendaData);
    const query = `UPDATE vendas SET ${camposParaAtualizar} WHERE id = ?`;
    
    await pool.execute(query, [...valores, id]);
    return this.findById(id);
  }

  /** Deleta uma venda. A tabela venda_itens será limpa em cascata. */
  public async delete(id: number): Promise<boolean> {
    const pool = ConnectionFactory.getPool();
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM vendas WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}