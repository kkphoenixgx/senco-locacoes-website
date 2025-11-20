import { Request, Response } from 'express';
import ClienteRepository from '../../repository/ClienteRepository';
import Authenticator from '../../Security/Authenticator';
import JWT from '../../Security/JWT';

export default class ClientesController {
  private clienteRepository = new ClienteRepository();

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
      return res.status(500).json({ message: error.message || 'Erro ao criar cliente.' });
    }
  }

  /** Realiza o login de um cliente e retorna um token de autenticação. */
  public async login(req: Request, res: Response): Promise<Response> {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const cliente = await Authenticator.authenticateCliente({ email, senha });
    if (!cliente) {
      return res.status(401).json({ message: 'Email ou senha incorretos.' });
    }

    const token = JWT.generate({ id: cliente.id, email: cliente.email });
    return res.json({ user: { id: cliente.id, email: cliente.email, nome: cliente.nome }, token });
  }

  /** Retorna todos os clientes (rota de administrador). */
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const clientes = await this.clienteRepository.findAll();
      return res.json(clientes);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
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
      return res.status(500).json({ message: error.message });
    }
  }

  /** Atualiza os dados de um cliente. */
  public async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const clienteData = req.body;

    if (req.user?.role !== 'admin' && req.user?.id !== Number(id)) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode atualizar seu próprio perfil.' });
    }

    const clienteAtualizado = await this.clienteRepository.update(Number(id), clienteData);
    return res.json(clienteAtualizado);
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