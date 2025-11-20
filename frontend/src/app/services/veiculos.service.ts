import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, map } from 'rxjs';
import Veiculos from '../model/items/Veiculos';
import { VendasService } from './vendas.service';

@Injectable({
  providedIn: 'root',
})
export class VeiculosService {
  private vendasService = inject(VendasService);
  private apiUrl = `${import.meta.env['NG_APP_API_URL']}/veiculos`;

  private mockVeiculos: Veiculos[] = [
    new Veiculos(1, 'Honda CBR 500R', 55000, 'Moto esportiva em excelente estado.', [], 1, 'Honda', 'CBR 500R', 2022, 2022, 5000, 'Vermelha'),
    new Veiculos(2, 'Mercedes-Benz Axor', 320000, 'Caminhão robusto para longas distâncias.', [], 2, 'Mercedes-Benz', 'Axor 2544', 2020, 2020, 150000, 'Branco'),
    new Veiculos(3, 'Voltz EV1 Sport', 20000, 'Scooter elétrica, econômica e moderna.', [], 3, 'Voltz', 'EV1 Sport', 2023, 2023, 1000, 'Cinza'),
  ];

  private veiculosSubject = new BehaviorSubject<Veiculos[]>(this.mockVeiculos);
  private nextId = 4;

  constructor() {}

  getVeiculos(): Observable<Veiculos[]> {
    return this.veiculosSubject.asObservable();
  }

  getVeiculosMaisVendidos(): Observable<Veiculos[]> {
    return this.vendasService.getVendas().pipe(
      map(vendas => {
        const salesCount = new Map<number, number>();

        // Conta as vendas de cada veículo
        vendas.forEach(venda => {
          venda.items.forEach(item => {
            if (item instanceof Veiculos) {
              salesCount.set(item.id, (salesCount.get(item.id) || 0) + 1);
            }
          });
        });

        // Ordena os veículos do mock com base na contagem de vendas
        const sortedVeiculos = [...this.mockVeiculos].sort((a, b) => {
          const countA = salesCount.get(a.id) || 0;
          const countB = salesCount.get(b.id) || 0;
          return countB - countA; // Ordem decrescente
        });

        return sortedVeiculos;
      })
    );
  }

  addVeiculo(veiculo: Omit<Veiculos, 'id'>) {
    const currentVeiculos = this.veiculosSubject.getValue();
    const newVeiculo = new Veiculos(this.nextId++, veiculo.titulo, veiculo.preco, veiculo.descricao, [], veiculo.categoriaId, veiculo.marca, veiculo.modelo, veiculo.anoFabricacao, veiculo.anoModelo, veiculo.quilometragem, veiculo.cor);
    this.veiculosSubject.next([...currentVeiculos, newVeiculo]);
  }

  updateVeiculo(updatedVeiculo: Veiculos) {
    const currentVeiculos = this.veiculosSubject.getValue();
    const index = currentVeiculos.findIndex(v => v.id === updatedVeiculo.id);
    if (index !== -1) {
      const newVeiculos = [...currentVeiculos];
      newVeiculos[index] = updatedVeiculo;
      this.veiculosSubject.next(newVeiculos);
    }
  }

  deleteVeiculo(id: number) {
    const currentVeiculos = this.veiculosSubject.getValue();
    const newVeiculos = currentVeiculos.filter(v => v.id !== id);
    this.veiculosSubject.next(newVeiculos);
  }
}