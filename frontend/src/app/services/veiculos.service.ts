import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import Veiculos from '../model/items/Veiculos';

@Injectable({
  providedIn: 'root',
})
export class VeiculosService {
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