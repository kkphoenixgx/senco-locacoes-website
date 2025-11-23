import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { effect } from '@angular/core';

/**
 * Impede que usuários autenticados acessem páginas de login/cadastro.
 * Se o usuário já estiver logado, ele será redirecionado para a página inicial.
 */
export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.authState().isAuthenticated) {
    return router.createUrlTree(['/']);
  }
  return true;
};