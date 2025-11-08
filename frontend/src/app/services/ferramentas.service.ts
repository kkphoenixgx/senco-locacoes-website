import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import Ferramentas from '../model/items/Ferramentas';

@Injectable({
  providedIn: 'root',
})
export class FerramentasService {
  private apiUrl = `${import.meta.env['NG_APP_API_URL']}/ferramentas`;

  private mockFerramentas: Ferramentas[] = [
    new Ferramentas(1, 'Betoneira 400L', 150, 'Betoneira para locação diária.', [], 1, 'Marca A', 'usada', 'Modelo X', '220v'),
    new Ferramentas(2, 'Andaime Tubular 1.5m', 50, 'Módulo de andaime tubular.', [], 2, 'Marca B', 'usada', 'Modelo Y'),
    new Ferramentas(3, 'Furadeira de Impacto', 80, 'Furadeira potente para concreto.', [], 3, 'Marca C', 'nova', 'Modelo Z', '110v'),
  ];

  private ferramentasSubject = new BehaviorSubject<Ferramentas[]>(this.mockFerramentas);
  private nextId = 4;

  constructor() {}

  getFerramentas(): Observable<Ferramentas[]> {
    return this.ferramentasSubject.asObservable();
  }

  addFerramenta(ferramenta: Omit<Ferramentas, 'id'>) {
    const currentFerramentas = this.ferramentasSubject.getValue();
    const newFerramenta = new Ferramentas(this.nextId++, ferramenta.titulo, ferramenta.preco, ferramenta.descricao, [], ferramenta.categoriaId, ferramenta.marca, ferramenta.condicao, ferramenta.modelo, ferramenta.voltagem);
    this.ferramentasSubject.next([...currentFerramentas, newFerramenta]);
  }

  updateFerramenta(updatedFerramenta: Ferramentas) {
    const currentFerramentas = this.ferramentasSubject.getValue();
    const index = currentFerramentas.findIndex(f => f.id === updatedFerramenta.id);
    if (index !== -1) {
      const newFerramentas = [...currentFerramentas];
      newFerramentas[index] = updatedFerramenta;
      this.ferramentasSubject.next(newFerramentas);
    }
  }

  deleteFerramenta(id: number) {
    const currentFerramentas = this.ferramentasSubject.getValue();
    const newFerramentas = currentFerramentas.filter(f => f.id !== id);
    this.ferramentasSubject.next(newFerramentas);
  }
}