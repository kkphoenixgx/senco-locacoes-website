import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Veiculo, VeiculosService } from '../../../../core/services/veiculos.service';

@Component({
  selector: 'app-adm-dashboard-veiculos',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adm-dashboard-veiculos.html',
  styleUrl: './adm-dashboard-veiculos.scss',
})
export class AdmDashboardVeiculos {
  private fb = inject(FormBuilder);
  private veiculosService = inject(VeiculosService);

  veiculos = this.veiculosService.veiculos;
  showForm = signal(false);
  editingVeiculoId = signal<number | null>(null);

  veiculoForm: FormGroup;

  constructor() {
    this.veiculoForm = this.fb.group({
      nome: ['', Validators.required],
      marca: ['', Validators.required],
      ano: ['', [Validators.required, Validators.min(1900)]],
      preco: ['', [Validators.required, Validators.min(0)]],
    });
  }

  onAddNew() {
    this.editingVeiculoId.set(null);
    this.veiculoForm.reset();
    this.showForm.set(true);
  }

  onEdit(veiculo: Veiculo) {
    this.editingVeiculoId.set(veiculo.id);
    this.veiculoForm.setValue({
      nome: veiculo.nome,
      marca: veiculo.marca,
      ano: veiculo.ano,
      preco: veiculo.preco,
    });
    this.showForm.set(true);
  }

  onSave() {
    if (this.veiculoForm.invalid) return;

    const id = this.editingVeiculoId();
    if (id) {
      this.veiculosService.updateVeiculo({ id, ...this.veiculoForm.value });
    } else {
      this.veiculosService.addVeiculo(this.veiculoForm.value);
    }
    this.showForm.set(false);
  }

  onDelete(id: number) {
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
      this.veiculosService.deleteVeiculo(id);
    }
  }

  onCancel() {
    this.showForm.set(false);
  }
}
