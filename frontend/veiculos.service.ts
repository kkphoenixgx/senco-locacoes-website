import { Injectable, signal } from '@angular/core';

export interface Veiculo {
  id: number;
  nome: string;
  marca: string;
  ano: number;
  preco: number;
}

@Injectable({
  providedIn: 'root',
})
export class VeiculosService {
  private veiculosSignal = signal<Veiculo[]>([
    { id: 1, nome: 'CBR 500R', marca: 'Honda', ano: 2023, preco: 55000 },
    { id: 2, nome: 'Axor', marca: 'Mercedes-Benz', ano: 2022, preco: 320000 },
    { id: 3, nome: 'EV1 Sport', marca: 'Voltz', ano: 2024, preco: 18000 },
  ]);

  private nextId = 4;

  get veiculos() {
    return this.veiculosSignal.asReadonly();
  }

  addVeiculo(veiculo: Omit<Veiculo, 'id'>) {
    const newVeiculo = { ...veiculo, id: this.nextId++ };
    this.veiculosSignal.update(veiculos => [...veiculos, newVeiculo]);
  }

  updateVeiculo(updatedVeiculo: Veiculo) {
    this.veiculosSignal.update(veiculos =>
      veiculos.map(v => (v.id === updatedVeiculo.id ? updatedVeiculo : v))
    );
  }

  deleteVeiculo(id: number) {
    this.veiculosSignal.update(veiculos =>
      veiculos.filter(v => v.id !== id)
    );
  }
}