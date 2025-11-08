import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import CategoriaVeiculos from '../model/items/CategoriaVeiculos';

@Injectable({
  providedIn: 'root',
})
export class CategoriasService {
  private apiUrl = import.meta.env['NG_APP_API_URL'];

  private mockCategoriasVeiculos: CategoriaVeiculos[] = [
    new CategoriaVeiculos(1, 'Motos'),
    new CategoriaVeiculos(2, 'Caminhões'),
    new CategoriaVeiculos(3, 'Scooters'),
  ];


  getCategoriasVeiculos(): Observable<CategoriaVeiculos[]> {
    return of(this.mockCategoriasVeiculos);
  }

}