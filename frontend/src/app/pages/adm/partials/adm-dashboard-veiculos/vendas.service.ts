import { Injectable, signal } from '@angular/core';

export interface Venda {
  id: number;
  cliente: string;
  produto: string;
  valor: number;
  data: Date;
}

@Injectable({
  providedIn: 'root',
})
export class VendasService {
  private vendasSignal = signal<Venda[]>([
    { id: 101, cliente: 'João Silva', produto: 'Honda CBR 500R', valor: 55000, data: new Date('2025-10-28') },
    { id: 102, cliente: 'Maria Costa', produto: 'Betoneira 400L', valor: 3500, data: new Date('2025-11-02') },
    { id: 103, cliente: 'Carlos Pereira', produto: 'Voltz EV1 Sport', valor: 18000, data: new Date('2025-11-05') },
  ]);

  get vendas() {
    return this.vendasSignal.asReadonly();
  }

  // In a real app, you might have a method to add a new sale
  // addVenda(venda: Omit<Venda, 'id'>) { ... }
}