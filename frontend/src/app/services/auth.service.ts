import { computed, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environment';
import Cliente from '../model/Cliente';
import { Router } from '@angular/router';

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
  
  private _authState = signal<{ isAuthenticated: boolean; role: UserRole | null; user: any | null }>({
    isAuthenticated: this.hasToken(),
    role: this.getRole(),
    user: this.getUser()
  });
  public authState = computed(() => this._authState());


  constructor(private http: HttpClient, private router: Router) {}


  //? ----------- Methods -----------

  /** * Armazena o token e o papel do usuário no localStorage e atualiza o estado de autenticação. * @param token O token JWT. * @param role O papel do usuário ('admin' ou 'client'). * @param user Os dados do usuário. */
  private handleAuthentication(token: string, role: UserRole, user: any): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, role);
    localStorage.setItem('senco_user', JSON.stringify(user));

    this._authState.set({ isAuthenticated: true, role, user });
  }

  /** * Realiza o logout do usuário ou do adm, limpando o armazenamento local e atualizando o estado. */
  logout(): void {
    localStorage.clear();
    this._authState.set({ isAuthenticated: false, role: null, user: null });
    this.router.navigate(['/login']);
  }

  //? ----------- Clientes -----------

  /** * Registra um novo cliente. * @param clienteData Os dados do novo cliente. */
  registerCliente(clienteData: Omit<Cliente, 'id'> & { senhaPlana: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, clienteData)
      .pipe(tap((response) => this.handleAuthentication(response.token, 'client', response.user)));
  }

  /** * Realiza o login do cliente. * @param email O email do cliente. * @param senha A senha do cliente. */
  loginCliente(email: string, senha: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, senha })
      .pipe(
        tap( (response) => 
          this.handleAuthentication(response.token, 'client', response.user)
        ),
        catchError(AuthService.handleError)
      );
  }

  //? ----------- Adms -----------

  /** * Realiza o login do administrador.* @param email O email do administrador. * @param senha A senha do administrador. * @returns Um Observable com a resposta da autenticação. */
  login(email: string, password: string): Observable<AuthResponse> {
    const credentials = { email, senha: password };
    
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/adms/login`, credentials)
      .pipe(
        tap((response) => this.handleAuthentication(response.token, 'admin', response.user)),
        catchError(AuthService.handleError)
      )
    ;
  }

  /**
   * Verifica se o usuário autenticado é um cliente.
   */
  isCliente(): boolean {
    return this.authState().isAuthenticated && this.authState().role === 'client';
  }

  //? ----------- Helpers -----------

  /** * Retorna o token de autenticação armazenado. * @returns O token JWT ou `null` se não existir. */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /** * Verifica se existe um token de autenticação armazenado. * @returns `true` se o token existir, `false` caso contrário. */
  private hasToken(): boolean {
    console.log(!!localStorage.getItem(this.TOKEN_KEY));
    
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private getRole(): UserRole | null {
    return localStorage.getItem(this.USER_KEY) as UserRole | null;
  }

  private getUser(): any | null {
    const user = localStorage.getItem('senco_user');
    try {
      return user ? JSON.parse(user) : null;
    } 
    catch (e) {
      return null;
    }

  }
  /** * Trata os erros de requisições HTTP. * @param error O objeto de erro. * @returns Um Observable que emite o erro. */
  private static handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }

}