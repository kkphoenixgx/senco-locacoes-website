import { Request, Response } from 'express';
import Authenticator from '../../Security/Authenticator';
import JWT from '../../Security/JWT';

export default class AdmsController {
  
  private authenticator = new Authenticator();
  
  constructor() {
    // Garante que o 'this' dentro do método 'login' sempre se refira à instância da classe.
    this.login = this.login.bind(this);
  }

  /** * Realiza o login de um administrador. * @param req A requisição Express, contendo email e senha no corpo. * @param res A resposta Express. * @returns Uma Promise que resolve para a resposta Express. */
  public async login(req: Request, res: Response): Promise<Response> {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json(
        {  message: 'Email e senha são obrigatórios.'  }
      );
    }

    try {
      const adm = await this.authenticator.authenticateAdm({ email, senha });

      if (!adm) {
        return res.status(401).json(
          { message: 'Email ou senha incorretos.' }
        );
      }

      const token = JWT.generate({ email: adm.email, role: 'admin' });

      return res.json({ user: { email: adm.email }, token });
    } 
    catch (error) {
      // Log do erro no console do servidor para depuração.
      console.error('Erro no login do administrador:', error);
      // Retorna a mensagem de erro específica para o frontend.
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor.';
      return res.status(500).json({ message: errorMessage });
    }
  
  }

}