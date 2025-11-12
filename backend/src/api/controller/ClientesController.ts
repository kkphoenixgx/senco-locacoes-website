import { Request, Response } from 'express';
// As implementações do Repository e Authenticator para Cliente seriam necessárias aqui.
// import ClientesRepository from '../../repositories/ClientesRepository';
// import Authenticator from '../../Security/Authenticator';
import JWT from '../../Security/JWT';

export default class ClientesController {
  /** Cria um novo cliente e retorna um token de autenticação. */
  public async create(req: Request, res: Response): Promise<Response> {
    const { nome, email, senha, telefone, endereco } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    }

    try {
      // const clientesRepository = new ClientesRepository();
      // const novoCliente = await clientesRepository.create({ nome, email, senha, telefone, endereco });

      // Lógica de exemplo até o repositório ser implementado
      console.log('Criando cliente:', { nome, email });
      const token = JWT.generate({ email });

      return res.status(201).json({ user: { nome, email }, token });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao criar cliente.' });
    }
  }

  /** Realiza o login de um cliente e retorna um token de autenticação. */
  public async login(req: Request, res: Response): Promise<Response> {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    // Aqui entraria a lógica com o Authenticator.authenticateCliente
    // const cliente = await Authenticator.authenticateCliente({ email, senha });
    // if (!cliente) { ... }

    const token = JWT.generate({ email });
    return res.json({ user: { email }, token });
  }
}