import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environment';

import Cliente from '../model/Cliente';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private http = inject(HttpClient);
  private clientesUrl = `${environment.apiUrl}/clientes`;

  /**
   * Busca todos os clientes da API (requer autenticação de admin).
   */
  getClientes(): Observable<Cliente[]> {
    return this.http.get<any[]>(this.clientesUrl).pipe(
      map(data => data.map(item => this.mapToCliente(item))),
      catchError(err => {
        console.error('Erro ao buscar clientes:', err);
        return of([]);
      })
    );
  }

  /**
   * Busca os dados do perfil do cliente autenticado.
   */
  getProfile(): Observable<Cliente> {
    return this.http.get<any>(`${this.clientesUrl}/me`).pipe(
      map(item => this.mapToCliente(item))
    );
  }

  /** * Atualiza os dados do perfil do cliente autenticado. * @param clienteData Os dados a serem atualizados. */
  updateProfile(clienteData: Partial<Cliente>): Observable<Cliente> {
    return this.http.put<Cliente>(`${environment.apiUrl}/auth/me`, clienteData);
  }

  /** * Deleta um cliente da API. * @param id O ID do cliente a ser deletado. */
  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.clientesUrl}/${id}`);
  }

  private mapToCliente(item: any): Cliente {
    return new Cliente(item.id, item.nome, item.telefone, item.email, item.endereco);
  }
}