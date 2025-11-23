import { Request, Response } from 'express';
import ClienteRepository from '../../repository/ClienteRepository';
import Authenticator from '../../Security/Authenticator';
import JWT from '../../Security/JWT';

export default class ClientesController {
  private clienteRepository = new ClienteRepository();
  private authenticator = new Authenticator();

  constructor() {
    // Garante o 'this' correto nos métodos
    this.create = this.create.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.findAll = this.findAll.bind(this);
    this.findById = this.findById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  /** Cria um novo cliente e retorna um token de autenticação. */
  public async create(req: Request, res: Response): Promise<Response> {
    const { nome, email, senhaPlana, telefone, endereco } = req.body;

    if (!nome || !email || !senhaPlana) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    }

    try {
      const novoCliente = await this.clienteRepository.create({ nome, email, senhaPlana, telefone, endereco });
      const token = JWT.generate({ id: novoCliente.id, email: novoCliente.email });

      return res.status(201).json({ user: { id: novoCliente.id, nome, email }, token });
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar cliente.';
      return res.status(500).json({ message: errorMessage });
    }
  }

  /** Realiza o login de um cliente e retorna um token de autenticação. */
  public async login(req: Request, res: Response): Promise<Response> {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
      const cliente = await this.authenticator.authenticateCliente({ email, senha });
      if (!cliente) {
        return res.status(401).json({ message: 'Email ou senha incorretos.' });
      }

      const token = JWT.generate({ id: cliente.id, email: cliente.email, role: 'client' });
      return res.json({ user: { id: cliente.id, email: cliente.email, nome: cliente.nome }, token });
    } catch (error) {
      console.error('Erro no login do cliente:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor.';
      return res.status(500).json({ message: errorMessage });
    }
  }

  /** Retorna o perfil do cliente atualmente autenticado. */
  public async getProfile(req: Request, res: Response): Promise<Response> {
    const clienteId = req.user?.id;

    if (!clienteId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
      const cliente = await this.clienteRepository.findById(clienteId);
      if (!cliente) return res.status(404).json({ message: 'Cliente não encontrado.' });
      return res.json(cliente);
    } catch (error: any) {
      console.error('Erro ao buscar perfil do cliente:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor.';
      return res.status(500).json({ message: errorMessage });
    }
  }

  /** Retorna todos os clientes (rota de administrador). */
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const clientes = await this.clienteRepository.findAll();
      return res.json(clientes);
    } catch (error: any) {
      console.error('Erro ao buscar todos os clientes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor.';
      return res.status(500).json({ message: errorMessage });
    }
  }

  /** Retorna um cliente específico pelo ID. */
  public async findById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      const cliente = await this.clienteRepository.findById(Number(id));
      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado.' });
      }
      return res.json(cliente);
    } catch (error: any) {
      console.error(`Erro ao buscar cliente por ID ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor.';
      return res.status(500).json({ message: errorMessage });
    }
  }

  /** Atualiza os dados de um cliente. */
  public async update(req: Request, res: Response): Promise<Response> {
    const id = req.user?.id; // Pega o ID do usuário autenticado pelo token
    const clienteData = req.body;

    if (!id) {
      return res.status(401).json({ message: 'Acesso negado. Usuário não autenticado.' });
    }

    try {
      // Remove o email do objeto de dados para garantir que não seja alterado
      delete clienteData.email;

      const clienteAtualizado = await this.clienteRepository.update(id, clienteData);
      return res.json(clienteAtualizado);
    } catch (error: any) {
      console.error(`Erro ao atualizar cliente com ID ${id}:`, error);
      return res.status(500).json({ message: 'Erro ao atualizar dados do cliente.' });
    }
  }

  /** Deleta um cliente. */
  public async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    if (req.user?.role !== 'admin' && req.user?.id !== Number(id)) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode deletar seu próprio perfil.' });
    }
    await this.clienteRepository.delete(Number(id));
    return res.status(204).send();
  }
}