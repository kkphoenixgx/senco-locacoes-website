import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';
import Venda from '../model/Venda';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private http = inject(HttpClient);

  requestPurchase(vehicleId: number): Observable<Venda> {
    return this.http.post<Venda>(`${environment.apiUrl}/purchase/request`, { vehicleId });
  }
}