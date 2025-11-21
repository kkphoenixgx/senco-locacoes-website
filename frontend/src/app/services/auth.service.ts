import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environment';
import Cliente from '../model/Cliente';

interface AuthResponse {
  user: {
    id?: number;
    nome?: string;
    email: string;
  };
  token: string;
}

type UserRole = 'admin' | 'client';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'senco_auth_token';
  private readonly USER_KEY = 'senco_user_role';

  // Sinal para saber se o usuário está logado e qual o seu papel
  public authState = signal<{ isAuthenticated: boolean; role: UserRole | null }>({
    isAuthenticated: this.hasToken(),
    role: this.getRole(),
  });

  constructor(private http: HttpClient) {}

  /**
   * Realiza o login do administrador.
   * @param email O email do administrador.
   * @param senha A senha do administrador.
   * @returns Um Observable com a resposta da autenticação.
   */
  login(email: string, password: string): Observable<AuthResponse> {
    // O backend espera 'senha', mas o formulário envia 'password'.
    // Fazemos a conversão aqui para manter o serviço desacoplado do formulário.
    const credentials = { email, senha: password };
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/adms/login`, credentials)
      .pipe(
        tap((response) => this.handleAuthentication(response.token, 'admin', response.user)),
        catchError(this.handleError)
      );
  }

  /**
   * Realiza o login do cliente.
   * @param email O email do cliente.
   * @param senha A senha do cliente.
   */
  loginCliente(email: string, senha: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/clientes/login`, { email, senha })
      .pipe(
        tap((response) => this.handleAuthentication(response.token, 'client', response.user)),
        catchError(this.handleError)
      );
  }

  /**
   * Registra um novo cliente.
   * @param clienteData Os dados do novo cliente.
   */
  registerCliente(clienteData: Omit<Cliente, 'id'> & { senhaPlana: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/clientes`, clienteData)
      .pipe(tap((response) => this.handleAuthentication(response.token, 'client', response.user)));
  }

  /**
   * Realiza o logout do usuário, limpando o armazenamento local e atualizando o estado.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.authState.set({ isAuthenticated: false, role: null });
  }

  /**
   * Retorna o token de autenticação armazenado.
   * @returns O token JWT ou `null` se não existir.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Verifica se existe um token de autenticação armazenado.
   * @returns `true` se o token existir, `false` caso contrário.
   */
  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private getRole(): UserRole | null {
    return localStorage.getItem(this.USER_KEY) as UserRole | null;
  }

  /**
   * Armazena o token e o papel do usuário no localStorage e atualiza o estado de autenticação.
   * @param token O token JWT.
   * @param role O papel do usuário ('admin' ou 'client').
   * @param user Os dados do usuário.
   */
  private handleAuthentication(token: string, role: UserRole, user: any): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, role);
    // TODO: Armazenar dados do usuário se necessário
    this.authState.set({ isAuthenticated: true, role });
  }

  /**
   * Trata os erros de requisições HTTP.
   * @param error O objeto de erro.
   * @returns Um Observable que emite o erro.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido. Tente novamente.';
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro retornado pelo backend
      if (error.status === 401) {
        errorMessage = 'Email ou senha incorretos.';
      } else if (error.status === 400) {
        errorMessage = 'Dados inválidos. Verifique os campos e tente novamente.';
      } else if (error.status >= 500) {
        errorMessage = 'Ocorreu um erro no servidor. Tente novamente mais tarde.';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}