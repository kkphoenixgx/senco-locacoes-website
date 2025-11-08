import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import CategoriaVeiculos from '../model/items/CategoriaVeiculos';
import CategoriaFerramentas from '../model/items/CategoriaFerramentas';

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

  private mockCategoriasFerramentas: CategoriaFerramentas[] = [
    new CategoriaFerramentas(1, 'Construção Civil'),
    new CategoriaFerramentas(2, 'Acesso e Elevação'),
    new CategoriaFerramentas(3, 'Ferramentas Elétricas'),
  ];

  getCategoriasVeiculos(): Observable<CategoriaVeiculos[]> {
    return of(this.mockCategoriasVeiculos);
  }

  getCategoriasFerramentas(): Observable<CategoriaFerramentas[]> {
    return of(this.mockCategoriasFerramentas);
  }
}