import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../../environment';

export interface IDashboardStats {
  totalVeiculos: number;
  totalClientes: number;
  totalVendas: number;
  faturamentoTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private statsUrl = `${environment.apiUrl}/dashboard/stats`;

  getStats(): Observable<IDashboardStats | null> {
    return this.http.get<IDashboardStats>(this.statsUrl).pipe(catchError(err => {
      console.error('Erro ao buscar estatísticas do dashboard:', err);
      return of(null);
    }));
  }
}