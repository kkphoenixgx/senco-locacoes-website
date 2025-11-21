import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environment';
import CategoriaVeiculos from '../model/items/CategoriaVeiculos';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private http = inject(HttpClient);
  private categoriasUrl = `${environment.apiUrl}/categorias`;

  getCategorias(): Observable<CategoriaVeiculos[]> {
    return this.http.get<CategoriaVeiculos[]>(this.categoriasUrl).pipe(
      catchError(err => {
        console.error('Erro ao buscar categorias:', err);
        return of([]); // Retorna um array vazio em caso de erro
      })
    );
  }

  /**
   * Cria uma nova categoria.
   * @param categoriaData Os dados da nova categoria.
   */
  createCategoria(categoriaData: { nome: string, descricao?: string }): Observable<CategoriaVeiculos> {
    return this.http.post<CategoriaVeiculos>(this.categoriasUrl, categoriaData);
  }

  /**
   * Atualiza uma categoria existente.
   * @param id O ID da categoria a ser atualizada.
   * @param categoriaData Os dados a serem atualizados.
   */
  updateCategoria(id: number, categoriaData: Partial<CategoriaVeiculos>): Observable<CategoriaVeiculos> {
    return this.http.put<CategoriaVeiculos>(`${this.categoriasUrl}/${id}`, categoriaData);
  }

  /**
   * Deleta uma categoria.
   * @param id O ID da categoria a ser deletada.
   */
  deleteCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.categoriasUrl}/${id}`);
  }
}