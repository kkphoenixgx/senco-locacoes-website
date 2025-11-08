import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import Venda from '../model/Venda';
import Veiculos from '../model/items/Veiculos';
import Cliente from '../model/Cliente';

@Injectable({
  providedIn: 'root',
})
export class VendasService {
  private apiUrl = `${import.meta.env['NG_APP_API_URL']}/vendas`;

  private mockVendas: Venda[] = [
    new Venda(
      1,
      [new Veiculos(1, 'Honda CBR 500R', 55000, 'Moto esportiva.', [], 1, 'CBR 500R', 2022, 2022, 5000, 'Vermelha')],
      new Date('2025-10-26'),
      55000,
      1,
      new Cliente(1, 'João Silva', '(11) 98765-4321', 'joao.silva@example.com', 'Rua Fictícia, 123')
    ),
    new Venda(
      2,
      [new Veiculos(2, 'Mercedes-Benz Axor', 320000, 'Caminhão robusto.', [], 2, 'Axor 2544', 2020, 2020, 150000, 'Branco')],
      new Date('2025-11-05'),
      320000,
      2,
      new Cliente(2, 'Maria Souza', '(21) 91234-5678', 'maria.souza@example.com', 'Avenida de Testes, 456')
    ),
  ];

  constructor() {}

  getVendas(): Observable<Venda[]> {
    return of(this.mockVendas);
  }
}