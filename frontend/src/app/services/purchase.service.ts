import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private http = inject(HttpClient);
  private purchaseUrl = `${environment.apiUrl}/purchase/request`;

  requestPurchase(vehicleId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.purchaseUrl, { vehicleId });
  }
}