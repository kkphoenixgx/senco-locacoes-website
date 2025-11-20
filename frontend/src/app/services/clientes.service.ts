import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import Cliente from '../model/Cliente';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private mockClientes: Cliente[] = [
    new Cliente(1, 'João Silva', '(11) 98765-4321', 'joao.silva@example.com', 'Rua Fictícia, 123'),
    new Cliente(2, 'Maria Souza', '(21) 91234-5678', 'maria.souza@example.com', 'Avenida de Testes, 456'),
    new Cliente(3, 'Carlos Pereira', '(31) 99999-8888', 'carlos.p@example.com', 'Praça da Liberdade, 789'),
  ];

  constructor() {}

  getClientes(): Observable<Cliente[]> {
    return of(this.mockClientes);
  }
}