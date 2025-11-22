import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Protege rotas que exigem autenticação de cliente.
 * Se o usuário não for um cliente autenticado, ele será redirecionado para a página de login.
 */
export const clientAuthGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const { isAuthenticated, role } = authService.authState();

  return isAuthenticated && role === 'client' ? true : router.createUrlTree(['/login']);
};