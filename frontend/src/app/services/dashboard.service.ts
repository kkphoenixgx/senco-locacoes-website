import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
    return this.http.get<IDashboardStats>(this.statsUrl).pipe(
      catchError(() => of(null)) // Retorna nulo em caso de erro
    );
  }
}