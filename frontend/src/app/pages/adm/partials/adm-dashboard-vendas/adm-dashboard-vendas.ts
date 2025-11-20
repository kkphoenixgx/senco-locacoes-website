import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VendasService } from '../../../../services/vendas.service';
import { VeiculosService } from '../../../../services/veiculos.service';
import { ClientesService } from '../../../../services/clientes.service';
import Venda from '../../../../model/Venda';
import Veiculo from '../../../../model/items/Veiculos';
import Cliente from '../../../../model/Cliente';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-adm-dashboard-vendas',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adm-dashboard-vendas.html',
  styleUrl: './adm-dashboard-vendas.scss',
})
export class AdmDashboardVendas implements OnInit {
  private fb = inject(FormBuilder);
  private vendasService = inject(VendasService);
  private veiculosService = inject(VeiculosService);
  private clientesService = inject(ClientesService);

  vendas$!: Observable<Venda[]>;
  veiculos$!: Observable<Veiculo[]>;
  clientes$!: Observable<Cliente[]>;

  showForm = signal(false);
  editingVendaId = signal<number | null>(null);
  vendaForm: FormGroup;

  constructor() {
    this.vendaForm = this.fb.group({
      clienteId: [null, Validators.required],
      veiculoId: [null, Validators.required],
      dataVenda: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.vendas$ = this.vendasService.getVendas();
    this.veiculos$ = this.veiculosService.getVeiculos();
    this.clientes$ = this.clientesService.getClientes();
  }

  onAddNew() {
    this.editingVendaId.set(null);
    this.vendaForm.reset();
    this.showForm.set(true);
  }

  onEdit(venda: Venda) {
    this.editingVendaId.set(venda.id);
    this.showForm.set(true);
    this.vendaForm.setValue({
      clienteId: venda.clienteId,
      veiculoId: venda.items[0]?.id || null,
      dataVenda: new Date(venda.dataVenda).toISOString().split('T')[0], // Formato YYYY-MM-DD
    });
  }

  onSave() {
    if (this.vendaForm.invalid) return;

    const id = this.editingVendaId();
    const formValue = this.vendaForm.value;

    // Mock: Encontrar o cliente e o veículo selecionados para construir o objeto
    // Em um cenário real, isso poderia ser tratado de forma diferente.
    let veiculo: Veiculo | undefined;
    this.veiculos$.pipe(tap(veiculos => veiculo = veiculos.find(v => v.id === +formValue.veiculoId))).subscribe();
    let cliente: Cliente | undefined;
    this.clientes$.pipe(tap(clientes => cliente = clientes.find(c => c.id === +formValue.clienteId))).subscribe();

    if (!veiculo || !cliente) return;

    const vendaData = new Venda(id || 0, [veiculo], new Date(formValue.dataVenda), veiculo.preco, cliente.id, cliente);

    if (id) {
      this.vendasService.updateVenda(vendaData);
    } else {
      this.vendasService.addVenda(vendaData);
    }

    this.showForm.set(false);
  }

  onDelete(id: number) {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      this.vendasService.deleteVenda(id);
    }
  }

  onCancel() {
    this.showForm.set(false);
  }
}
