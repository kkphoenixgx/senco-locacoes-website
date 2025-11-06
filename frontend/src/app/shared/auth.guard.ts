import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// No futuro, você pode injetar seu serviço de autenticação real aqui.
// import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  // const authService = inject(AuthService); // Exemplo de como injetar seu serviço

  // Lógica de autenticação (placeholder):
  // Verificamos se existe um 'admin-token' no localStorage.
  // Substitua esta linha pela sua verificação real, como: authService.isAuthenticated()
  const isAuthenticated = !!localStorage.getItem('admin-token');

  if (isAuthenticated) {
    return true; // Usuário autenticado, permite o acesso à rota.
  } else {
    // Usuário não autenticado, redireciona para a página de login do admin.
    router.navigate(['/adm/login']);
    return false; // Bloqueia o acesso à rota.
  }
};