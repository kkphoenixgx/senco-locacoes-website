import "dotenv/config";
import express, { Router } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import ms from "ms";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import nodemailer from "nodemailer";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
class Encrypt {
  constructor() {
  }
  /** * Encripta uma senha usando bcrypt. * @param senha A senha em texto plano a ser encriptada. * @returns Uma Promise que resolve para a senha encriptada. */
  static async hash(senha) {
    const saltRounds = 10;
    const senhaHasheada = await bcrypt.hash(senha, saltRounds);
    return senhaHasheada;
  }
  /** * Compara uma senha em texto plano com um hash. * @param senha A senha em texto plano. * @param hash O hash para comparar. * @returns Uma Promise que resolve para 'true' se a senha corresponder ao hash, senão 'false'. */
  static async compare(senha, hash) {
    const corresponde = await bcrypt.compare(senha, hash);
    return corresponde;
  }
}
class Adm {
  //? ----------- Constructor -----------
  /** * O construtor é privado para forçar a criação de instâncias através do método `create`,* garantindo que a senha seja sempre encriptada. * @param email O email do administrador. * @param senhaHash O hash da senha do administrador. */
  constructor(email, senhaHash) {
    this.email = email;
    this.senhaHash = senhaHash;
  }
  //? ----------- Methods -----------
  /** * Cria uma nova instância de Adm, encriptando a senha fornecida. * @param email O email do administrador. * @param senhaPlana A senha em texto plano. * @returns Uma Promise que resolve para uma nova instância de Adm. */
  static async create(email, senhaPlana) {
    const password_hash = await Encrypt.hash(senhaPlana);
    return new Adm(email, password_hash);
  }
  /** * Verifica se a senha fornecida corresponde à senha armazenada. * @param senhaPlana A senha em texto plano para ser comparada. * @returns Uma Promise que resolve para 'true' se a senha estiver correta, e 'false' caso contrário. */
  async isPasswordCorrect(senhaPlana) {
    return Encrypt.compare(senhaPlana, this.senhaHash);
  }
  /** Recria uma instância de Adm a partir de dados do banco de dados. */
  static fromDB(data) {
    return new Adm(data.email, data.senha_hash);
  }
  //? ----------- Getters and Setters -----------
}
class ConnectionFactory {
  static pool = null;
  constructor() {
  }
  /**
   * Retorna a instância única do pool de conexões, criando-a se ainda não existir.
   * Este é o único ponto de acesso ao pool, garantindo o padrão Singleton.
   */
  static getPool() {
    if (!this.pool) {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    }
    return this.pool;
  }
}
class AdmRepository {
  /** Cria um novo administrador no banco de dados. */
  async create(adm) {
    const pool = ConnectionFactory.getPool();
    const query = "INSERT INTO adms (email, senha_hash) VALUES (?, ?)";
    try {
      const [result] = await pool.execute(query, [adm.email, adm.senhaHash]);
      if (result.insertId) {
        return adm;
      } else {
        throw new Error("Não foi possível criar o administrador.");
      }
    } catch (error) {
      console.error("Erro ao criar administrador:", error);
      if (error instanceof Error && error.message.includes("Duplicate entry")) {
        throw new Error("O email fornecido já está em uso.");
      }
      throw new Error("Erro ao salvar administrador no banco de dados.");
    }
  }
  /** Busca um administrador pelo email. */
  async findByEmail(email) {
    const pool = ConnectionFactory.getPool();
    const query = "SELECT * FROM adms WHERE email = ?";
    try {
      const [rows] = await pool.execute(query, [email]);
      if (rows.length === 0) return null;
      const rowData = rows[0];
      if (!rowData || typeof rowData.email !== "string" || typeof rowData.senha_hash !== "string") {
        console.error("Dados do administrador inválidos recebidos do banco de dados:", rowData);
        throw new Error("Formato de dados do administrador inválido no banco de dados.");
      }
      return Adm.fromDB(rowData);
    } catch (error) {
      console.error("Erro ao buscar administrador por email:", error);
      throw new Error("Erro ao acessar o banco de dados.");
    }
  }
  /** Atualiza a senha de um administrador. */
  async update(email, admData) {
    const pool = ConnectionFactory.getPool();
    if (!admData.senhaHash) {
      throw new Error("Apenas a atualização de senha é suportada.");
    }
    const query = "UPDATE adms SET senha_hash = ? WHERE email = ?";
    try {
      const [result] = await pool.execute(query, [admData.senhaHash, email]);
      if (result.affectedRows > 0) {
        return this.findByEmail(email);
      }
      return null;
    } catch (error) {
      console.error(`Erro ao atualizar adm com email ${email}:`, error);
      throw new Error("Erro ao atualizar administrador no banco de dados.");
    }
  }
  /** Deleta um administrador pelo email. */
  async delete(email) {
    const pool = ConnectionFactory.getPool();
    const query = "DELETE FROM adms WHERE email = ?";
    try {
      const [result] = await pool.execute(query, [email]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Erro ao deletar adm com email ${email}:`, error);
      throw new Error("Erro ao deletar administrador no banco de dados.");
    }
  }
}
class Cliente {
  //? ----------- Constructor -----------
  /** * O construtor é privado para forçar a criação de instâncias através do método `create`, * garantindo que a senha seja sempre encriptada. */
  constructor(id, nome, telefone, email, senha_hash, endereco) {
    this.id = id;
    this.nome = nome;
    this.telefone = telefone;
    this.email = email;
    this.senha_hash = senha_hash;
    this.endereco = endereco;
  }
  //? ----------- Methods -----------
  /** Cria uma nova instância de Cliente, encriptando a senha fornecida. * @returns Uma Promise que resolve para uma nova instância de Cliente. */
  static async create(id, nome, telefone, email, senhaPlana, endereco) {
    const senha_hash = await Encrypt.hash(senhaPlana);
    return new Cliente(id, nome, telefone, email, senha_hash, endereco);
  }
  /** Recria uma instância de Cliente a partir de dados do banco de dados. */
  static fromDB(data) {
    return new Cliente(data.id, data.nome, data.telefone, data.email, data.senha_hash, data.endereco);
  }
  /** Verifica se a senha fornecida corresponde à senha armazenada. */
  async isPasswordCorrect(senhaPlana) {
    return Encrypt.compare(senhaPlana, this.senha_hash);
  }
}
class ClienteRepository {
  /** Cria um novo cliente no banco de dados. */
  async create(clienteData) {
    const pool = ConnectionFactory.getPool();
    const query = "INSERT INTO clientes (nome, telefone, email, senha_hash, endereco) VALUES (?, ?, ?, ?, ?)";
    try {
      const cliente = await Cliente.create(0, clienteData.nome, clienteData.telefone, clienteData.email, clienteData.senhaPlana, clienteData.endereco);
      const [result] = await pool.execute(query, [
        cliente.nome,
        cliente.telefone,
        cliente.email,
        cliente.senha_hash,
        cliente.endereco
      ]);
      if (result.insertId) {
        return Cliente.fromDB({ ...cliente, id: result.insertId });
      } else {
        throw new Error("Não foi possível criar o cliente.");
      }
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      if (error instanceof Error && error.message.includes("Duplicate entry")) {
        throw new Error("O email fornecido já está em uso.");
      }
      throw new Error("Erro ao salvar cliente no banco de dados.");
    }
  }
  /** Busca todos os clientes no banco de dados. */
  async findAll() {
    const pool = ConnectionFactory.getPool();
    const query = "SELECT * FROM clientes";
    try {
      const [rows] = await pool.execute(query);
      return rows.map((row) => Cliente.fromDB(row));
    } catch (error) {
      console.error("Erro ao buscar todos os clientes:", error);
      throw new Error("Erro ao buscar clientes no banco de dados.");
    }
  }
  /** Busca um cliente pelo seu ID. */
  async findById(id) {
    const pool = ConnectionFactory.getPool();
    const query = "SELECT * FROM clientes WHERE id = ?";
    try {
      const [rows] = await pool.execute(query, [id]);
      if (rows.length === 0) return null;
      return Cliente.fromDB(rows[0]);
    } catch (error) {
      console.error(`Erro ao buscar cliente com ID ${id}:`, error);
      throw new Error("Erro ao buscar cliente no banco de dados.");
    }
  }
  /** Busca um cliente pelo seu email. */
  async findByEmail(email) {
    const pool = ConnectionFactory.getPool();
    const query = "SELECT * FROM clientes WHERE email = ?";
    try {
      const [rows] = await pool.execute(query, [email]);
      if (rows.length === 0) return null;
      return Cliente.fromDB(rows[0]);
    } catch (error) {
      console.error(`Erro ao buscar cliente com email ${email}:`, error);
      throw new Error("Erro ao buscar cliente no banco de dados.");
    }
  }
  /** Atualiza os dados de um cliente. */
  async update(id, clienteData) {
    const pool = ConnectionFactory.getPool();
    const camposParaAtualizar = [];
    const valores = [];
    for (const [key, value] of Object.entries(clienteData)) {
      if (value !== void 0 && key !== "senhaPlana") {
        camposParaAtualizar.push(`${key} = ?`);
        valores.push(value);
      }
    }
    if (clienteData.senhaPlana) {
      camposParaAtualizar.push("senha_hash = ?");
      valores.push(await Encrypt.hash(clienteData.senhaPlana));
    }
    if (camposParaAtualizar.length === 0) return this.findById(id);
    const query = `UPDATE clientes SET ${camposParaAtualizar.join(", ")} WHERE id = ?`;
    valores.push(id);
    try {
      await pool.execute(query, valores);
      return this.findById(id);
    } catch (error) {
      console.error(`Erro ao atualizar cliente com ID ${id}:`, error);
      throw new Error("Erro ao atualizar cliente no banco de dados.");
    }
  }
  /** Deleta um cliente do banco de dados. */
  async delete(id) {
    const pool = ConnectionFactory.getPool();
    const [result] = await pool.execute("DELETE FROM clientes WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}
class Authenticator {
  admRepository = new AdmRepository();
  clienteRepository = new ClienteRepository();
  //? ----------- Methods -----------
  /** * Autentica um administrador com base em suas credenciais. * @param credentials As credenciais (email e senha) do administrador. * @returns Uma Promise que resolve para a instância de Adm se a autenticação for bem-sucedida, ou null caso contrário.*/
  async authenticateAdm(credentials) {
    const { email, senha } = credentials;
    const adm = await this.admRepository.findByEmail(email);
    if (!adm) return null;
    return await adm.isPasswordCorrect(senha) ? adm : null;
  }
  /** * Autentica um cliente com base em suas credenciais. * @param credentials As credenciais (email e senha) do cliente. * @returns Uma Promise que resolve para a instância de Cliente se a autenticação for bem-sucedida, ou null caso contrário.*/
  async authenticateCliente(credentials) {
    const { email, senha } = credentials;
    const cliente = await this.clienteRepository.findByEmail(email);
    if (!cliente) return null;
    return await cliente.isPasswordCorrect(senha) ? cliente : null;
  }
}
const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || "default-secret-for-development",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  }
};
class JWT {
  constructor() {
  }
  //? ----------- Métodos -----------
  /** * Gera um token JWT. * @param payload O conteúdo a ser incluído no token (ex: { id: 1, email: 'user@email.com' }). * @returns O token JWT gerado como uma string. */
  static generate(payload) {
    const { secret, expiresIn } = authConfig.jwt;
    const expiresInSeconds = Math.floor(ms(expiresIn) / 1e3);
    const signOptions = {
      expiresIn: expiresInSeconds
    };
    return jwt.sign(payload, secret, signOptions);
  }
  /** * Verifica a validade de um token JWT. * @param token O token JWT a ser verificado. * @returns O payload decodificado se o token for válido. * @throws Lança um erro se o token for inválido ou expirado. */
  static verify(token) {
    const { secret } = authConfig.jwt;
    return jwt.verify(token, secret);
  }
}
class AdmsController {
  authenticator = new Authenticator();
  constructor() {
    this.login = this.login.bind(this);
  }
  /** * Realiza o login de um administrador. * @param req A requisição Express, contendo email e senha no corpo. * @param res A resposta Express. * @returns Uma Promise que resolve para a resposta Express. */
  async login(req, res) {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json(
        { message: "Email e senha são obrigatórios." }
      );
    }
    try {
      const adm = await this.authenticator.authenticateAdm({ email, senha });
      if (!adm) {
        return res.status(401).json(
          { message: "Email ou senha incorretos." }
        );
      }
      const token = JWT.generate({ email: adm.email, role: "admin" });
      return res.json({ user: { email: adm.email }, token });
    } catch (error) {
      console.error("Erro no login do administrador:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor.";
      return res.status(500).json({ message: errorMessage });
    }
  }
}
const admRoutes = Router();
const admsController = new AdmsController();
admRoutes.post("/adms/login", admsController.login);
const __filename = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename);
const uploadFolder = path.resolve(__dirname$1, "..", "..", "..", "uploads");
const uploadConfig = {
  directory: uploadFolder,
  storage: multer.diskStorage({
    destination: uploadFolder,
    filename(_, file, callback) {
      const fileHash = crypto.randomBytes(10).toString("hex");
      const fileName = `${fileHash}-${file.originalname}`;
      return callback(null, fileName);
    }
  })
};
function ensureAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Token de autenticação não fornecido." });
  }
  const [, token] = authHeader.split(" ");
  try {
    const payload = JWT.verify(token);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token JWT inválido ou expirado." });
  }
}
class ItemsVendidos {
  //? ----------- Constructor -----------
  constructor(id, titulo, preco, descricao, imagens) {
    this.id = id;
    this.titulo = titulo;
    this.preco = preco;
    this.descricao = descricao;
    this.imagens = imagens;
  }
  //? ----------- Methods -----------
  getPrecoFormatado() {
    return this.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
}
class Veiculo extends ItemsVendidos {
  //? ----------- Constructor -----------
  constructor(id, titulo, preco, descricao, imagens, categoriaId, modelo, marca, anoFabricacao, anoModelo, quilometragem, cor, documentacao, revisoes, categoria) {
    super(id, titulo, preco, descricao, imagens);
    this.categoriaId = categoriaId;
    this.modelo = modelo;
    this.marca = marca;
    this.anoFabricacao = anoFabricacao;
    this.anoModelo = anoModelo;
    this.quilometragem = quilometragem;
    this.cor = cor;
    this.documentacao = documentacao;
    this.revisoes = revisoes;
    this.categoria = categoria;
  }
  //? ----------- Getters and Setters -----------
  /** * Retorna o ano formatado para exibição, como "2007/2008" ou "2007". */
  getAnoFormatado() {
    if (this.anoFabricacao === this.anoModelo) {
      return this.anoFabricacao.toString();
    }
    const modeloAbreviado = this.anoModelo.toString().slice(-2);
    return `${this.anoFabricacao}/${modeloAbreviado}`;
  }
}
class CategoriaVeiculos {
  //? ----------- Constructor -----------
  constructor(id, nome, descricao) {
    this.id = id;
    this.nome = nome;
    this.descricao = descricao;
  }
}
class VeiculoRepository {
  /** Cria um novo veículo no banco de dados e associa suas imagens. */
  async create(veiculoData, nomesImagens) {
    const pool = ConnectionFactory.getPool();
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    const veiculoQuery = `
      INSERT INTO veiculos (titulo, preco, descricao, categoria_id, modelo, marca, ano_fabricacao, ano_modelo, quilometragem, cor, documentacao, revisoes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    try {
      const [result] = await connection.execute(
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
      const imagemQuery = "INSERT INTO veiculo_imagens (veiculo_id, caminho_imagem) VALUES ?";
      const imagensValues = nomesImagens.map((nome) => [veiculoId, nome]);
      await connection.query(imagemQuery, [imagensValues]);
      const [categoriaRows] = await connection.execute("SELECT * FROM categoria_veiculos WHERE id = ?", [veiculoData.categoriaId]);
      const categoriaData = categoriaRows[0];
      const categoria = new CategoriaVeiculos(categoriaData.id, categoriaData.nome, categoriaData.descricao);
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
    } catch (error) {
      await connection.rollback();
      console.error("Erro ao criar veículo:", error);
      throw new Error("Erro ao salvar veículo no banco de dados.");
    } finally {
      connection.release();
    }
  }
  /** Busca todos os veículos no banco de dados. */
  async findAll(filters = {}, page = 1, limit = 12) {
    const pool = ConnectionFactory.getPool();
    let query = `
      SELECT 
        v.*,
        c.nome as categoria_nome,
        c.descricao as categoria_descricao,
        (SELECT GROUP_CONCAT(vi.caminho_imagem) FROM veiculo_imagens vi WHERE vi.veiculo_id = v.id) as imagens
      FROM veiculos v
      JOIN categoria_veiculos c ON v.categoria_id = c.id
    `;
    const params = [];
    const whereClauses = [];
    if (filters.nome) {
      whereClauses.push("v.titulo LIKE ?");
      params.push(`%${filters.nome}%`);
    }
    if (filters.marca) {
      whereClauses.push("v.marca = ?");
      params.push(filters.marca);
    }
    if (filters.ano) {
      whereClauses.push("v.ano_fabricacao = ?");
      params.push(Number(filters.ano));
    }
    if (filters.precoMin) {
      whereClauses.push("v.preco >= ?");
      params.push(Number(filters.precoMin));
    }
    if (filters.precoMax) {
      whereClauses.push("v.preco <= ?");
      params.push(Number(filters.precoMax));
    }
    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(" AND ")}`;
    }
    query += ` ORDER BY v.id DESC LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);
    try {
      const [rows] = await pool.execute(query, params);
      return rows.map((row) => {
        const categoria = new CategoriaVeiculos(row.categoria_id, row.categoria_nome, row.categoria_descricao);
        const imagens = row.imagens ? row.imagens.split(",") : [];
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
      console.error("Erro ao buscar todos os veículos:", error);
      throw new Error("Erro ao buscar veículos no banco de dados.");
    }
  }
  /** Busca os veículos mais vendidos, ordenados pela quantidade de vendas. */
  async findMaisVendidos(limit = 10) {
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
      const [rows] = await pool.execute(query, [limit]);
      return rows.map((row) => {
        const categoria = new CategoriaVeiculos(row.categoria_id, row.categoria_nome, row.categoria_descricao);
        const imagens = row.imagens ? row.imagens.split(",") : [];
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
      console.error("Erro ao buscar veículos mais vendidos:", error);
      throw new Error("Erro ao buscar veículos mais vendidos no banco de dados.");
    }
  }
  /** Busca um veículo específico pelo seu ID. */
  async findById(id) {
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
      const [rows] = await pool.execute(query, [id]);
      if (rows.length === 0) {
        return null;
      }
      const row = rows[0];
      const categoria = new CategoriaVeiculos(row.categoria_id, row.categoria_nome, row.categoria_descricao);
      const imagens = row.imagens ? row.imagens.split(",") : [];
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
      throw new Error("Erro ao buscar veículo no banco de dados.");
    }
  }
  /** Atualiza os dados de um veículo. */
  async update(id, veiculoData, nomesNovasImagens) {
    const pool = ConnectionFactory.getPool();
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      if (nomesNovasImagens && nomesNovasImagens.length > 0) {
        const [oldImagesRows] = await connection.execute("SELECT caminho_imagem FROM veiculo_imagens WHERE veiculo_id = ?", [id]);
        const oldImageFiles = oldImagesRows.map((row) => row.caminho_imagem);
        await connection.execute("DELETE FROM veiculo_imagens WHERE veiculo_id = ?", [id]);
        const imagemQuery = "INSERT INTO veiculo_imagens (veiculo_id, caminho_imagem) VALUES ?";
        const imagensValues = nomesNovasImagens.map((nome) => [id, nome]);
        await connection.query(imagemQuery, [imagensValues]);
        const uploadDir = path.resolve(__dirname, "..", "..", "uploads");
        for (const filename of oldImageFiles) {
          try {
            await fs.unlink(path.join(uploadDir, filename));
          } catch (err) {
            console.error(`Falha ao deletar arquivo de imagem antigo: ${filename}`, err);
          }
        }
      }
      const camposParaAtualizar = Object.keys(veiculoData).filter((key) => key !== "imagens" && veiculoData[key] !== void 0).map((key) => `${key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)} = ?`).join(", ");
      if (camposParaAtualizar.length > 0) {
        const valores = Object.entries(veiculoData).filter(([key, value]) => key !== "imagens" && value !== void 0).map(([key, value]) => {
          const numericFields = ["preco", "categoriaId", "anoFabricacao", "anoModelo", "quilometragem"];
          return numericFields.includes(key) ? Number(value) : value;
        });
        const updateQuery = `UPDATE veiculos SET ${camposParaAtualizar} WHERE id = ?`;
        await connection.execute(updateQuery, [...valores, id]);
      }
      await connection.commit();
      return this.findById(id);
    } catch (error) {
      await connection.rollback();
      console.error(`Erro ao atualizar veículo com ID ${id}:`, error);
      throw new Error("Erro ao atualizar veículo no banco de dados.");
    } finally {
      connection.release();
    }
  }
  /** Deleta um veículo do banco de dados. */
  async delete(id) {
    const pool = ConnectionFactory.getPool();
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [vendaItens] = await connection.execute("SELECT venda_id FROM venda_itens WHERE veiculo_id = ? LIMIT 1", [id]);
      if (vendaItens.length > 0) {
        throw new Error("Não é possível excluir o veículo, pois ele já foi vendido e está associado a um histórico de vendas.");
      }
      await connection.execute("DELETE FROM veiculo_imagens WHERE veiculo_id = ?", [id]);
      const [result] = await connection.execute("DELETE FROM veiculos WHERE id = ?", [id]);
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.error(`Erro ao deletar veículo com ID ${id}:`, error);
      if (error instanceof Error) throw error;
      throw new Error("Erro ao deletar veículo no banco de dados.");
    } finally {
      connection.release();
    }
  }
}
class VeiculosController {
  veiculoRepository = new VeiculoRepository();
  constructor() {
    this.create = this.create.bind(this);
    this.findAll = this.findAll.bind(this);
    this.findById = this.findById.bind(this);
    this.findMaisVendidos = this.findMaisVendidos.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }
  async create(req, res) {
    const veiculoData = req.body;
    const { files } = req;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ message: "Pelo menos uma imagem é necessária." });
    }
    veiculoData.preco = parseFloat(veiculoData.preco);
    veiculoData.categoriaId = parseInt(veiculoData.categoriaId, 10);
    veiculoData.anoFabricacao = parseInt(veiculoData.anoFabricacao, 10);
    veiculoData.anoModelo = parseInt(veiculoData.anoModelo, 10);
    veiculoData.quilometragem = parseInt(veiculoData.quilometragem, 10);
    const nomesDasImagens = files.map((file) => file.filename);
    try {
      const novoVeiculo = await this.veiculoRepository.create(veiculoData, nomesDasImagens);
      return res.status(201).json(novoVeiculo);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("banco de dados")) {
          return res.status(500).json({ message: error.message });
        }
      }
      return res.status(500).json({ message: "Ocorreu um erro inesperado ao criar o veículo." });
    }
  }
  async findAll(req, res) {
    const filters = req.query;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 12;
    try {
      const veiculos = await this.veiculoRepository.findAll(filters, page, limit);
      return res.json(veiculos);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async findById(req, res) {
    const { id } = req.params;
    try {
      const veiculo = await this.veiculoRepository.findById(Number(id));
      if (!veiculo) {
        return res.status(404).json({ message: "Veículo não encontrado." });
      }
      return res.json(veiculo);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async findMaisVendidos(req, res) {
    try {
      const veiculos = await this.veiculoRepository.findMaisVendidos();
      return res.json(veiculos);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async update(req, res) {
    const { id } = req.params;
    const veiculoData = req.body;
    const { files } = req;
    const novasImagens = Array.isArray(files) ? files.map((file) => file.filename) : void 0;
    try {
      const veiculoAtualizado = await this.veiculoRepository.update(Number(id), veiculoData, novasImagens);
      return res.json(veiculoAtualizado);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async delete(req, res) {
    const { id } = req.params;
    const success = await this.veiculoRepository.delete(Number(id));
    if (!success) {
      return res.status(404).json({ message: "Veículo não encontrado." });
    }
    return res.status(204).send();
  }
}
const veiculosRoutes = Router();
const upload = multer(uploadConfig);
const veiculosController = new VeiculosController();
veiculosRoutes.get("/veiculos", veiculosController.findAll);
veiculosRoutes.get("/veiculos/mais-vendidos", veiculosController.findMaisVendidos);
veiculosRoutes.get("/veiculos/:id", veiculosController.findById);
veiculosRoutes.post("/veiculos", ensureAuthenticated, upload.array("imagens", 10), veiculosController.create);
veiculosRoutes.put("/veiculos/:id", ensureAuthenticated, upload.array("imagens", 10), veiculosController.update);
veiculosRoutes.delete("/veiculos/:id", ensureAuthenticated, veiculosController.delete);
class ClientesController {
  clienteRepository = new ClienteRepository();
  authenticator = new Authenticator();
  constructor() {
    this.create = this.create.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.findAll = this.findAll.bind(this);
    this.findById = this.findById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }
  /** Cria um novo cliente e retorna um token de autenticação. */
  async create(req, res) {
    const { nome, email, senhaPlana, telefone, endereco } = req.body;
    if (!nome || !email || !senhaPlana) {
      return res.status(400).json({ message: "Nome, email e senha são obrigatórios." });
    }
    try {
      const novoCliente = await this.clienteRepository.create({ nome, email, senhaPlana, telefone, endereco });
      const token = JWT.generate({ id: novoCliente.id, email: novoCliente.email });
      return res.status(201).json({ user: { id: novoCliente.id, nome, email }, token });
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar cliente.";
      return res.status(500).json({ message: errorMessage });
    }
  }
  /** Realiza o login de um cliente e retorna um token de autenticação. */
  async login(req, res) {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ message: "Email e senha são obrigatórios." });
    }
    try {
      const cliente = await this.authenticator.authenticateCliente({ email, senha });
      if (!cliente) {
        return res.status(401).json({ message: "Email ou senha incorretos." });
      }
      const token = JWT.generate({ id: cliente.id, email: cliente.email, role: "client" });
      return res.json({ user: { id: cliente.id, email: cliente.email, nome: cliente.nome }, token });
    } catch (error) {
      console.error("Erro no login do cliente:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor.";
      return res.status(500).json({ message: errorMessage });
    }
  }
  /** Retorna o perfil do cliente atualmente autenticado. */
  async getProfile(req, res) {
    const clienteId = req.user?.id;
    if (!clienteId) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }
    try {
      const cliente = await this.clienteRepository.findById(clienteId);
      if (!cliente) return res.status(404).json({ message: "Cliente não encontrado." });
      return res.json(cliente);
    } catch (error) {
      console.error("Erro ao buscar perfil do cliente:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor.";
      return res.status(500).json({ message: errorMessage });
    }
  }
  /** Retorna todos os clientes (rota de administrador). */
  async findAll(req, res) {
    try {
      const clientes = await this.clienteRepository.findAll();
      return res.json(clientes);
    } catch (error) {
      console.error("Erro ao buscar todos os clientes:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor.";
      return res.status(500).json({ message: errorMessage });
    }
  }
  /** Retorna um cliente específico pelo ID. */
  async findById(req, res) {
    const { id } = req.params;
    try {
      const cliente = await this.clienteRepository.findById(Number(id));
      if (!cliente) {
        return res.status(404).json({ message: "Cliente não encontrado." });
      }
      return res.json(cliente);
    } catch (error) {
      console.error(`Erro ao buscar cliente por ID ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor.";
      return res.status(500).json({ message: errorMessage });
    }
  }
  /** Atualiza os dados de um cliente. */
  async update(req, res) {
    const { id } = req.params;
    const clienteData = req.body;
    if (req.user?.role !== "admin" && req.user?.id !== Number(id)) {
      return res.status(403).json({ message: "Acesso negado. Você só pode atualizar seu próprio perfil." });
    }
    const clienteAtualizado = await this.clienteRepository.update(Number(id), clienteData);
    return res.json(clienteAtualizado);
  }
  /** Deleta um cliente. */
  async delete(req, res) {
    const { id } = req.params;
    if (req.user?.role !== "admin" && req.user?.id !== Number(id)) {
      return res.status(403).json({ message: "Acesso negado. Você só pode deletar seu próprio perfil." });
    }
    await this.clienteRepository.delete(Number(id));
    return res.status(204).send();
  }
}
function ensureAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Acesso negado. Rota exclusiva para administradores." });
  }
  return next();
}
const clientesRoutes = Router();
const clientesController = new ClientesController();
clientesRoutes.post("/clientes", clientesController.create);
clientesRoutes.post("/clientes/login", clientesController.login);
clientesRoutes.get("/clientes/me", ensureAuthenticated, clientesController.getProfile);
clientesRoutes.get("/clientes", ensureAuthenticated, ensureAdmin, clientesController.findAll);
clientesRoutes.get("/clientes/:id", ensureAuthenticated, clientesController.findById);
clientesRoutes.put("/clientes/:id", ensureAuthenticated, clientesController.update);
clientesRoutes.delete("/clientes/:id", ensureAuthenticated, clientesController.delete);
class Venda {
  //? ----------- Constructor -----------
  constructor(id, items, dataVenda, precoTotal, clienteId, cliente) {
    this.id = id;
    this.items = items;
    this.dataVenda = dataVenda;
    this.precoTotal = precoTotal;
    this.clienteId = clienteId;
    this.cliente = cliente;
  }
  //? ----------- Methods -----------
  getPrecoTotalFormatado() {
    return this.precoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  //? ----------- Getters and Setters -----------
}
class VendaRepository {
  clienteRepository;
  veiculoRepository;
  constructor() {
    this.clienteRepository = new ClienteRepository();
    this.veiculoRepository = new VeiculoRepository();
  }
  async create(vendaData) {
    const pool = ConnectionFactory.getPool();
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const vendaQuery = "INSERT INTO vendas (data_venda, preco_total, cliente_id) VALUES (?, ?, ?)";
      const [vendaResult] = await connection.execute(vendaQuery, [
        vendaData.dataVenda,
        vendaData.precoTotal,
        vendaData.clienteId
      ]);
      const vendaId = vendaResult.insertId;
      const itensQuery = "INSERT INTO venda_itens (venda_id, veiculo_id) VALUES ?";
      const itensValues = vendaData.items.map((item) => [vendaId, item.id]);
      await connection.query(itensQuery, [itensValues]);
      await connection.commit();
      return this.findById(vendaId);
    } catch (error) {
      await connection.rollback();
      console.error("Erro ao criar venda:", error);
      throw new Error("Erro ao salvar venda no banco de dados.");
    } finally {
      connection.release();
    }
  }
  /** Busca uma venda pelo seu ID. */
  async findById(id) {
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
    const [rows] = await pool.execute(query, [id]);
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
    const veiculosVendidos = rows.map((row) => new Veiculo(
      row.veiculo_id,
      row.titulo,
      row.preco,
      row.descricao,
      row.imagens ? row.imagens.split(",") : [],
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
  async findAll() {
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
      ORDER BY v.data_venda DESC
    `;
    const [rows] = await pool.execute(query);
    const vendasMap = /* @__PURE__ */ new Map();
    for (const row of rows) {
      if (!vendasMap.has(row.venda_id)) {
        const cliente = Cliente.fromDB({
          id: row.cliente_id,
          nome: row.cliente_nome,
          telefone: row.cliente_telefone,
          email: row.cliente_email,
          endereco: row.cliente_endereco,
          senha_hash: row.senha_hash
        });
        vendasMap.set(row.venda_id, { vendaData: row, cliente, veiculos: [] });
      }
      const veiculo = new Veiculo(
        row.veiculo_id,
        row.titulo,
        row.preco,
        row.descricao,
        row.imagens ? row.imagens.split(",") : [],
        0,
        row.modelo,
        row.marca,
        row.ano_fabricacao,
        row.ano_modelo,
        row.quilometragem,
        row.cor,
        row.documentacao,
        row.revisoes
      );
      vendasMap.get(row.venda_id).veiculos.push(veiculo);
    }
    const vendas = [];
    for (const [vendaId, data] of vendasMap.entries()) {
      vendas.push(new Venda(
        vendaId,
        data.veiculos,
        new Date(data.vendaData.data_venda),
        parseFloat(data.vendaData.preco_total),
        data.vendaData.cliente_id,
        data.cliente
      ));
    }
    return vendas;
  }
  /**
   * Atualiza dados de uma venda.
   * Nota: A atualização de itens é uma operação complexa e não está implementada.
   * Apenas data, preço total e cliente podem ser atualizados.
   */
  async update(id, vendaData) {
    const pool = ConnectionFactory.getPool();
    const camposParaAtualizar = Object.keys(vendaData).map((key) => `${key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)} = ?`).join(", ");
    if (camposParaAtualizar.length === 0) return this.findById(id);
    const valores = Object.values(vendaData);
    const query = `UPDATE vendas SET ${camposParaAtualizar} WHERE id = ?`;
    await pool.execute(query, [...valores, id]);
    return this.findById(id);
  }
  /** Deleta uma venda. A tabela venda_itens será limpa em cascata. */
  async delete(id) {
    const pool = ConnectionFactory.getPool();
    const [result] = await pool.execute("DELETE FROM vendas WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}
class VendasController {
  vendaRepository;
  constructor() {
    this.vendaRepository = new VendaRepository();
    this.create = this.create.bind(this);
    this.findAll = this.findAll.bind(this);
    this.findById = this.findById.bind(this);
    this.delete = this.delete.bind(this);
  }
  async create(req, res) {
    const vendaData = req.body;
    try {
      vendaData.clienteId = req.user?.id;
      const novaVenda = await this.vendaRepository.create(vendaData);
      return res.status(201).json(novaVenda);
    } catch (error) {
      return res.status(500).json({ message: error.message || "Erro ao criar venda." });
    }
  }
  async findAll(req, res) {
    try {
      const vendas = await this.vendaRepository.findAll();
      return res.json(vendas);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async findById(req, res) {
    const { id } = req.params;
    try {
      const venda = await this.vendaRepository.findById(Number(id));
      if (!venda) {
        return res.status(404).json({ message: "Venda não encontrada." });
      }
      return res.json(venda);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async delete(req, res) {
    const { id } = req.params;
    const success = await this.vendaRepository.delete(Number(id));
    if (!success) {
      return res.status(404).json({ message: "Venda não encontrada." });
    }
    return res.status(204).send();
  }
}
const vendasRoutes = Router();
const vendasController = new VendasController();
vendasRoutes.use(ensureAuthenticated);
vendasRoutes.post("/vendas", vendasController.create);
vendasRoutes.get("/vendas", vendasController.findAll);
vendasRoutes.get("/vendas/:id", vendasController.findById);
vendasRoutes.delete("/vendas/:id", vendasController.delete);
class CategoriaVeiculosRepository {
  pool = ConnectionFactory.getPool();
  /** Busca todas as categorias de veículos. */
  async findAll() {
    const [rows] = await this.pool.execute("SELECT * FROM categoria_veiculos ORDER BY nome");
    return rows.map((row) => new CategoriaVeiculos(row.id, row.nome, row.descricao));
  }
  /** Busca uma categoria pelo ID. */
  async findById(id) {
    const [rows] = await this.pool.execute("SELECT * FROM categoria_veiculos WHERE id = ?", [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return new CategoriaVeiculos(row.id, row.nome, row.descricao);
  }
  /** Cria uma nova categoria. */
  async create(categoria) {
    const query = "INSERT INTO categoria_veiculos (nome, descricao) VALUES (?, ?)";
    const [result] = await this.pool.execute(query, [categoria.nome, categoria.descricao]);
    if (result.insertId) {
      return new CategoriaVeiculos(result.insertId, categoria.nome, categoria.descricao);
    }
    throw new Error("Não foi possível criar a categoria.");
  }
  /** Atualiza uma categoria existente. */
  async update(id, categoriaData) {
    const camposParaAtualizar = Object.keys(categoriaData).filter((key) => key !== "id").map((key) => `${key} = ?`).join(", ");
    if (camposParaAtualizar.length === 0) {
      return this.findById(id);
    }
    const valores = Object.entries(categoriaData).filter(([key]) => key !== "id").map(([, value]) => value);
    const query = `UPDATE categoria_veiculos SET ${camposParaAtualizar} WHERE id = ?`;
    try {
      await this.pool.execute(query, [...valores, id]);
      return this.findById(id);
    } catch (error) {
      console.error(`Erro ao atualizar categoria com ID ${id}:`, error);
      throw new Error("Erro ao atualizar categoria no banco de dados.");
    }
  }
  /** Deleta uma categoria. */
  async delete(id) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [veiculos] = await connection.execute("SELECT id FROM veiculos WHERE categoria_id = ? LIMIT 1", [id]);
      if (veiculos.length > 0) {
        throw new Error("Não é possível excluir a categoria, pois ela está associada a um ou mais veículos.");
      }
      const [result] = await connection.execute("DELETE FROM categoria_veiculos WHERE id = ?", [id]);
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.error(`Erro ao deletar categoria com ID ${id}:`, error);
      if (error instanceof Error) throw error;
      throw new Error("Erro ao deletar categoria no banco de dados.");
    } finally {
      connection.release();
    }
  }
}
class CategoriaVeiculosController {
  repository = new CategoriaVeiculosRepository();
  constructor() {
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }
  async findAll(req, res) {
    try {
      const categorias = await this.repository.findAll();
      return res.json(categorias);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async create(req, res) {
    const { nome, descricao } = req.body;
    if (!nome) {
      return res.status(400).json({ message: "O nome da categoria é obrigatório." });
    }
    try {
      const novaCategoria = await this.repository.create({ nome, descricao });
      return res.status(201).json(novaCategoria);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async update(req, res) {
    const { id } = req.params;
    const categoriaData = req.body;
    try {
      const categoriaAtualizada = await this.repository.update(Number(id), categoriaData);
      if (!categoriaAtualizada) {
        return res.status(404).json({ message: "Categoria não encontrada." });
      }
      return res.json(categoriaAtualizada);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async delete(req, res) {
    const { id } = req.params;
    try {
      const success = await this.repository.delete(Number(id));
      if (!success) {
        return res.status(404).json({ message: "Categoria não encontrada." });
      }
      return res.status(204).send();
    } catch (error) {
      if (error.message.includes("associada a um ou mais veículos")) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  }
}
const categoriasRoutes = Router();
const controller$3 = new CategoriaVeiculosController();
categoriasRoutes.get("/categorias", controller$3.findAll);
categoriasRoutes.post("/categorias", ensureAuthenticated, ensureAdmin, controller$3.create);
categoriasRoutes.put("/categorias/:id", ensureAuthenticated, ensureAdmin, controller$3.update);
categoriasRoutes.delete("/categorias/:id", ensureAuthenticated, ensureAdmin, controller$3.delete);
class DashboardRepository {
  pool = ConnectionFactory.getPool();
  async getStats() {
    const [veiculosResult] = await this.pool.execute("SELECT COUNT(*) as total FROM veiculos");
    const [clientesResult] = await this.pool.execute("SELECT COUNT(*) as total FROM clientes");
    const [vendasResult] = await this.pool.execute("SELECT COUNT(*) as total, COALESCE(SUM(preco_total), 0) as faturamento FROM vendas");
    const totalVeiculos = veiculosResult?.[0]?.total ?? 0;
    const totalClientes = clientesResult?.[0]?.total ?? 0;
    const totalVendas = vendasResult?.[0]?.total ?? 0;
    const faturamentoTotal = vendasResult?.[0]?.faturamento ?? 0;
    return {
      totalVeiculos,
      totalClientes,
      totalVendas,
      faturamentoTotal: +faturamentoTotal
    };
  }
}
class DashboardController {
  repository = new DashboardRepository();
  constructor() {
    this.getStats = this.getStats.bind(this);
  }
  async getStats(req, res) {
    try {
      const stats = await this.repository.getStats();
      return res.json(stats);
    } catch (error) {
      console.error("Erro ao buscar estatísticas do dashboard:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor.";
      return res.status(500).json({ message: errorMessage });
    }
  }
}
const dashboardRoutes = Router();
const controller$2 = new DashboardController();
dashboardRoutes.get("/dashboard/stats", ensureAuthenticated, ensureAdmin, controller$2.getStats);
class MailService {
  transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: Number(process.env.MAIL_PORT) === 465,
      // true para porta 465, false para outras
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });
  }
  /**
   * Envia um e-mail.
   * @param options As opções do e-mail (destinatário, assunto, corpo HTML).
   */
  async sendMail({ to, subject, html }) {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        html
      });
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error);
      throw new Error("Falha no serviço de envio de e-mail.");
    }
  }
}
const MailService$1 = new MailService();
class ContactController {
  constructor() {
    this.send = this.send.bind(this);
  }
  async send(req, res) {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }
    const adminEmail = process.env.ADMIN_MAIL;
    if (!adminEmail) {
      console.error("ADMIN_MAIL não está definido no .env");
      return res.status(500).json({ message: "Erro de configuração do servidor." });
    }
    const emailHtml = `
      <h1>Nova Mensagem de Contato</h1>
      <p>Você recebeu uma nova mensagem através do site Senco Engenharia.</p>
      <hr>
      <p><strong>Nome:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Telefone:</strong> ${phone || "Não informado"}</p>
      <hr>
      <h2>${subject}</h2>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `;
    try {
      await MailService$1.sendMail({
        to: adminEmail,
        subject: `Novo Contato: ${subject}`,
        html: emailHtml
      });
      return res.status(200).json({ message: "Mensagem enviada com sucesso!" });
    } catch (error) {
      console.error("Erro ao enviar mensagem de contato:", error);
      return res.status(500).json({ message: "Não foi possível enviar a mensagem. Tente novamente mais tarde." });
    }
  }
}
const contactRoutes = Router();
const controller$1 = new ContactController();
contactRoutes.post("/contact", controller$1.send);
class PurchaseController {
  clienteRepository = new ClienteRepository();
  veiculoRepository = new VeiculoRepository();
  constructor() {
    this.request = this.request.bind(this);
  }
  async request(req, res) {
    const { vehicleId } = req.body;
    const clienteId = req.user?.id;
    if (!vehicleId || !clienteId) {
      return res.status(400).json({ message: "ID do veículo e autenticação do cliente são obrigatórios." });
    }
    const adminEmail = process.env.ADMIN_MAIL;
    if (!adminEmail) {
      console.error("ADMIN_MAIL não está definido no .env");
      return res.status(500).json({ message: "Erro de configuração do servidor." });
    }
    try {
      const cliente = await this.clienteRepository.findById(clienteId);
      const veiculo = await this.veiculoRepository.findById(vehicleId);
      if (!cliente || !veiculo) {
        return res.status(404).json({ message: "Cliente ou veículo não encontrado." });
      }
      const emailHtml = `
        <h1>Nova Solicitação de Compra</h1>
        <p>O cliente <strong>${cliente.nome}</strong> demonstrou interesse formal na compra do seguinte veículo:</p>
        <hr>
        <h2>Detalhes do Veículo</h2>
        <p><strong>ID:</strong> ${veiculo.id}</p>
        <p><strong>Título:</strong> ${veiculo.titulo}</p>
        <p><strong>Preço:</strong> ${veiculo.getPrecoFormatado()}</p>
        <hr>
        <h2>Dados do Cliente</h2>
        <p><strong>Nome:</strong> ${cliente.nome}</p>
        <p><strong>Email:</strong> ${cliente.email}</p>
        <p><strong>Telefone:</strong> ${cliente.telefone || "Não informado"}</p>
        <p><strong>Endereço:</strong> ${cliente.endereco || "Não informado"}</p>
        <hr>
        <p><em>Por favor, entre em contato com o cliente para prosseguir com a negociação.</em></p>
      `;
      await MailService$1.sendMail({
        to: adminEmail,
        subject: `Solicitação de Compra - Veículo #${veiculo.id} (${veiculo.titulo})`,
        html: emailHtml
      });
      return res.status(200).json({ message: "Sua solicitação de compra foi enviada com sucesso! Entraremos em contato em breve." });
    } catch (error) {
      console.error("Erro ao processar solicitação de compra:", error);
      return res.status(500).json({ message: "Não foi possível processar sua solicitação. Tente novamente mais tarde." });
    }
  }
}
const purchaseRoutes = Router();
const controller = new PurchaseController();
purchaseRoutes.post("/purchase/request", ensureAuthenticated, controller.request);
const apiRoutes = Router();
apiRoutes.use(admRoutes);
apiRoutes.use(veiculosRoutes);
apiRoutes.use(clientesRoutes);
apiRoutes.use(vendasRoutes);
apiRoutes.use(categoriasRoutes);
apiRoutes.use(dashboardRoutes);
apiRoutes.use(contactRoutes);
apiRoutes.use(purchaseRoutes);
const router = Router();
router.use("/api", apiRoutes);
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Senco Engenharia API",
      version: "1.0.0",
      description: "API para o sistema de gerenciamento de veículos e vendas da Senco Engenharia."
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./src/api/routes/*.ts", "./src/model/**/*.ts"]
  // Caminho para os arquivos com anotações
};
const swaggerSpec = swaggerJsdoc(options);
const viteNodeApp = express();
const port$1 = process.env.API_PORT || 3e3;
viteNodeApp.get("/", (_, res) => {
  res.send("Olá, mundo com Vite + Node.js + TypeScript!");
});
viteNodeApp.use(cors());
viteNodeApp.use(express.json());
viteNodeApp.use("/files", express.static(uploadConfig.directory));
viteNodeApp.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
viteNodeApp.use("/", router);
if (process.env.NODE_ENV !== "test") {
  viteNodeApp.listen(port$1, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port$1}`);
  });
}
const port = process.env.API_PORT || 3e3;
async function startProductionServer() {
  try {
    const pool = ConnectionFactory.getPool();
    const connection = await pool.getConnection();
    console.log("✅ Conexão com o banco de dados estabelecida com sucesso!");
    connection.release();
    viteNodeApp.listen(port, () => {
      console.log(`🚀 Servidor de produção rodando em http://localhost:${port}`);
      console.log(`📄 Documentação da API disponível em http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    console.error("❌ Falha ao conectar com o banco de dados.");
    console.error(`   Erro: ${error.message}`);
    process.exit(1);
  }
}
startProductionServer();
