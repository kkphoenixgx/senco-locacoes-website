import { Injectable, signal } from '@angular/core';
import { of, delay, tap, map, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${import.meta.env['NG_APP_API_URL']}/auth`;

  // Sinal para reatividade do estado de autenticação
  isAuthenticated = signal<boolean>(!!localStorage.getItem('admin-token'));

  constructor() {}

  // Simula uma chamada de API para login
  login(email: string, password: string) {
    // Em uma aplicação real, você faria uma requisição HTTP POST
    // return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(...)

    return of({ email, password }).pipe(
      delay(1000), // Simula latência da rede
      map((credentials) => {
        if (credentials.email === 'admin@senco.com' && credentials.password === 'password') {
          const fakeToken = 'your-secure-token-here';
          localStorage.setItem('admin-token', fakeToken);
          this.isAuthenticated.set(true);
          return { success: true, token: fakeToken };
        }
        throw new Error('Credenciais inválidas. Tente novamente.');
      })
    );
  }

  logout() {
    localStorage.removeItem('admin-token');
    this.isAuthenticated.set(false);
  }
}