import { Request, Response, NextFunction } from 'express';
import JWT from '../../Security/JWT';

/** * Middleware para garantir que a rota só pode ser acessada por usuários autenticados. */
export default function ensureAuthenticated( req: Request, res: Response, next: NextFunction ): void | Response {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
  }

  // O formato do token é "Bearer TOKEN"
  const [, token] = authHeader.split(' ');

  try {
    const payload = JWT.verify(token);

    req.user = payload as { email: string };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token JWT inválido ou expirado.' });
  }
}