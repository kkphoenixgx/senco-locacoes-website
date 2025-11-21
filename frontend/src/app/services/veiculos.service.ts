import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import Veiculo from '../model/items/Veiculos';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root',
})
export class VeiculosService {
  private veiculosUrl = `${environment.apiUrl}/veiculos`;

  constructor(private http: HttpClient) {}

  /**
   * Busca todos os veículos da API.
   */
  getVeiculos(): Observable<Veiculo[]> {
    return this.http.get<any[]>(this.veiculosUrl).pipe(
      map((data) => data.map((item) => this.mapToVeiculo(item))),
      catchError(this.handleError)
    );
  }

  /**
   * Busca os veículos mais vendidos da API.
   */
  getVeiculosMaisVendidos(): Observable<Veiculo[]> {
    return this.http.get<any[]>(`${this.veiculosUrl}/mais-vendidos`).pipe(
      map((data) => data.map((item) => this.mapToVeiculo(item))),
      catchError(this.handleError)
    );
  }

  /**
   * Cria um novo veículo enviando os dados para a API.
   * @param veiculoData Os dados do veículo (sem o ID).
   * @param imagens Os arquivos de imagem.
   */
  createVeiculo(veiculoData: Omit<Veiculo, 'id' | 'getAnoFormatado' | 'categoria'>, imagens: File[]): Observable<Veiculo> {
    const formData = new FormData();

    // Adiciona os campos do veículo ao FormData
    Object.entries(veiculoData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        // FormData só aceita string ou Blob. Convertemos todos os valores para string.
        formData.append(key, String(value));
      }
    });
    // Adiciona os arquivos de imagem
    imagens.forEach(imagem => formData.append('imagens', imagem));

    return this.http.post<Veiculo>(this.veiculosUrl, formData);
  }

  /**
   * Deleta um veículo da API.
   * @param id O ID do veículo a ser deletado.
   */
  deleteVeiculo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.veiculosUrl}/${id}`);
  }

  /**
   * Atualiza os dados de um veículo existente, com suporte para substituição de imagens.
   * @param id O ID do veículo a ser atualizado.
   * @param veiculoData Os dados a serem atualizados.
   * @param imagens Os novos arquivos de imagem (opcional). Se fornecido, substituirá as imagens existentes.
   */
  updateVeiculo(id: number, veiculoData: Partial<Veiculo>, imagens?: File[]): Observable<Veiculo> {
    const formData = new FormData();

    // Adiciona os campos do veículo ao FormData, convertendo para string
    Object.entries(veiculoData).forEach(([key, value]) => {
      // Não enviar o array de strings de imagens antigas nem valores nulos
      if (value !== null && value !== undefined && key !== 'imagens') {
        formData.append(key, String(value));
      }
    });

    // Adiciona os novos arquivos de imagem, se houver
    if (imagens && imagens.length > 0) {
      imagens.forEach(imagem => formData.append('imagens', imagem));
    }

    return this.http.put<Veiculo>(`${this.veiculosUrl}/${id}`, formData);
  }

  private mapToVeiculo(item: any): Veiculo {
    // O construtor da classe Veiculo no frontend espera 'Veiculos', mas o backend envia 'Veiculo'
    // e os nomes dos campos estão em snake_case. Aqui fazemos a adaptação e montamos a URL completa da imagem.
    const imagensComUrlCompleta = item.imagens?.map(
      (nomeArquivo: string) => `${environment.apiUrl.replace('/api', '')}/files/${nomeArquivo}`
    );

    return new Veiculo(
      item.id, item.titulo, item.preco, item.descricao, 
      imagensComUrlCompleta, 
      item.categoria_id, item.marca, item.modelo, item.ano_fabricacao, item.ano_modelo, item.quilometragem, item.cor, item.documentacao, item.revisoes, item.categoria
    );
  }

  private handleError(error: any): Observable<any[]> {
    console.error('Ocorreu um erro ao buscar os veículos:', error);
    return of([]); // Retorna um array vazio em caso de erro para não quebrar a aplicação
  }
}