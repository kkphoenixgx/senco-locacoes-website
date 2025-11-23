import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import Veiculo from '../model/items/Veiculos';
import CategoriaVeiculos from '../model/items/CategoriaVeiculos';

@Injectable({
  providedIn: 'root'
})
export class VeiculosService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/veiculos';

  getVeiculos(filters: any = {}): Observable<Veiculo[]> {
    let params = new HttpParams();
    
    // Constrói os parâmetros de consulta a partir do objeto de filtros
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.append(key, value.toString());
      }
    });

    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      map(data => data.map(item => this.mapToVeiculo(item))),
      catchError(err => {
        console.error('Erro ao buscar veículos:', err);
        return of([]);
      })
    );
  }

  getVeiculosMaisVendidos(): Observable<Veiculo[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mais-vendidos`).pipe(
      map(data => data.map(item => this.mapToVeiculo(item)))
    );
  }

  getVeiculoById(id: number): Observable<Veiculo> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(item => this.mapToVeiculo(item))
    );
  }

  createVeiculo(formData: FormData): Observable<Veiculo> {
    return this.http.post<any>(this.apiUrl, formData).pipe(
      map(item => this.mapToVeiculo(item))
    );
  }

  updateVeiculo(id: number, formData: FormData): Observable<Veiculo> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData).pipe(
      map(item => this.mapToVeiculo(item))
    );
  }

  deleteVeiculo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private mapToVeiculo(item: any): Veiculo {
    const categoria = item.categoria ? new CategoriaVeiculos(item.categoria.id, item.categoria.nome, item.categoria.descricao) : undefined;
    const imagensCompletas = item.imagens?.map((img: string) => `http://localhost:3000/files/${img}`) || [];

    return new Veiculo(
      item.id, item.titulo, item.preco, item.descricao, imagensCompletas, item.categoriaId, item.marca, item.modelo, item.anoFabricacao, item.anoModelo, item.quilometragem, item.cor, item.documentacao, item.revisoes, categoria
    );
  }
}