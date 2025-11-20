import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para garantir que a rota só pode ser acessada por administradores.
 * Deve ser usado DEPOIS do `ensureAuthenticated`.
 */
export default function ensureAdmin(req: Request, res: Response, next: NextFunction): void | Response {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Rota exclusiva para administradores.' });
  }

  return next();
}