import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environment';
import Venda from '../model/Venda';
import Cliente from '../model/Cliente';
import Veiculo from '../model/items/Veiculos';

@Injectable({
  providedIn: 'root'
})
export class VendasService {
  private http = inject(HttpClient);
  private vendasUrl = `${environment.apiUrl}/vendas`;

  /**
   * Busca todas as vendas da API.
   */
  getVendas(): Observable<Venda[]> {
    return this.http.get<any[]>(this.vendasUrl).pipe(
      map(data => data.map(item => this.mapToVenda(item))),
      catchError(err => {
        console.error('Erro ao buscar vendas:', err);
        return of([]); // Retorna um array vazio em caso de erro
      })
    );
  }

  /**
   * Busca uma única venda pelo seu ID.
   * @param id O ID da venda.
   */
  getVendaById(id: number): Observable<Venda> {
    return this.http.get<any>(`${this.vendasUrl}/${id}`).pipe(
      map(item => this.mapToVenda(item))
    );
  }

  /**
   * Cria uma nova venda.
   * @param vendaData Os dados da venda, incluindo o ID do cliente e os itens.
   */
  createVenda(vendaData: { clienteId?: number, items: { id: number }[] }): Observable<Venda> {
    // O clienteId é opcional aqui, pois o backend o obtém do token de autenticação.
    return this.http.post<any>(this.vendasUrl, vendaData).pipe(
      map(item => this.mapToVenda(item))
    );
  }

  private mapToVenda(item: any): Venda {
    const cliente = new Cliente(item.cliente.id, item.cliente.nome, item.cliente.telefone, item.cliente.email, item.cliente.endereco);
    const veiculos = item.items.map((v: any) => new Veiculo(v.id, v.titulo, v.preco, v.descricao, v.imagens, v.categoriaId, v.marca, v.modelo, v.anoFabricacao, v.anoModelo, v.quilometragem, v.cor, v.documentacao, v.revisoes, v.categoria));
    
    return new Venda(item.id, veiculos, new Date(item.dataVenda), item.precoTotal, item.clienteId, cliente);
  }
}