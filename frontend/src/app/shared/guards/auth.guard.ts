import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
/**
 * Protege rotas que exigem autenticação de administrador.
 * Se o usuário não for um administrador autenticado, ele será redirecionado para a página de login de administrador.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('senco_auth_token');
  const role = localStorage.getItem('senco_user_role');

  if (token && role === 'admin') {
    return true;
  }

  return router.createUrlTree(['/adm/login']);
};