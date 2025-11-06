import { Injectable, signal } from '@angular/core';

export interface Ferramenta {
  id: number;
  nome: string;
  categoria: string;
  descricao: string;
}

@Injectable({
  providedIn: 'root',
})
export class FerramentasService {
  // Using a signal to hold the state, making it reactive.
  private ferramentasSignal = signal<Ferramenta[]>([
    { id: 1, nome: 'Betoneira 400L', categoria: 'Construção Civil', descricao: 'Misturador de concreto de alta capacidade.' },
    { id: 2, nome: 'Andaime Tubular 1.5m', categoria: 'Acesso e Elevação', descricao: 'Estrutura para trabalhos em altura.' },
    { id: 3, nome: 'Furadeira de Impacto', categoria: 'Ferramentas Elétricas', descricao: 'Para perfurações em alvenaria e concreto.' },
  ]);

  private nextId = 4;

  // Public read-only signal
  get ferramentas() {
    return this.ferramentasSignal.asReadonly();
  }

  addFerramenta(ferramenta: Omit<Ferramenta, 'id'>) {
    const newFerramenta = { ...ferramenta, id: this.nextId++ };
    this.ferramentasSignal.update(ferramentas => [...ferramentas, newFerramenta]);
  }

  updateFerramenta(updatedFerramenta: Ferramenta) {
    this.ferramentasSignal.update(ferramentas =>
      ferramentas.map(f => (f.id === updatedFerramenta.id ? updatedFerramenta : f))
    );
  }

  deleteFerramenta(id: number) {
    this.ferramentasSignal.update(ferramentas =>
      ferramentas.filter(f => f.id !== id)
    );
  }
}