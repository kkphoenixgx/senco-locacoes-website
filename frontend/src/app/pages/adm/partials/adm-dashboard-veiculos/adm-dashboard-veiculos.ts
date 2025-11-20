import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VeiculosService } from '../../../../services/veiculos.service';
import Veiculos from '../../../../model/items/Veiculos';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-adm-dashboard-veiculos',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adm-dashboard-veiculos.html',
  styleUrl: './adm-dashboard-veiculos.scss',
})
export class AdmDashboardVeiculos implements OnInit {
  private fb = inject(FormBuilder);
  private veiculosService = inject(VeiculosService);

  veiculos$!: Observable<Veiculos[]>;
  showForm = signal(false);
  editingVeiculoId = signal<number | null>(null);

  veiculoForm: FormGroup;

  constructor() {
    this.veiculoForm = this.fb.group({
      titulo: ['', Validators.required],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      anoModelo: ['', [Validators.required, Validators.min(1900)]],
      preco: ['', [Validators.required, Validators.min(0)]],
      // Adicionando campos para um CRUD mais completo
      quilometragem: [0, Validators.required],
      cor: ['', Validators.required],
      categoriaId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.veiculos$ = this.veiculosService.getVeiculos();
  }

  onAddNew() {
    this.editingVeiculoId.set(null);
    this.veiculoForm.reset();
    this.showForm.set(true);
  }

  onEdit(veiculo: Veiculos) {
    this.editingVeiculoId.set(veiculo.id);
    this.veiculoForm.setValue({
      titulo: veiculo.titulo,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      anoModelo: veiculo.anoModelo,
      preco: veiculo.preco,
      quilometragem: veiculo.quilometragem,
      cor: veiculo.cor,
      categoriaId: veiculo.categoriaId,
    });
    this.showForm.set(true);
  }

  onSave() {
    if (this.veiculoForm.invalid) return;

    const id = this.editingVeiculoId();
    const formValue = this.veiculoForm.value;

    if (id) {
      // Para atualização, criamos uma nova instância com os dados do formulário e o ID existente.
      const updatedVeiculo = new Veiculos(
        id,
        formValue.titulo,
        formValue.preco,
        'Descrição padrão', // Descrição placeholder
        [], // Imagens placeholder
        formValue.marca,
        formValue.categoriaId,
        formValue.modelo,
        formValue.anoModelo, // Simplificação: anoFabricacao = anoModelo
        formValue.anoModelo,
        formValue.quilometragem,
        formValue.cor
      );
      this.veiculosService.updateVeiculo(updatedVeiculo);
    } else {
      // Para criação, passamos o objeto de dados para o serviço, que criará a instância.
      const newVeiculoData = {
        ...formValue,
        anoFabricacao: formValue.anoModelo, // Simplificação
        descricao: 'Descrição padrão',
      };
      this.veiculosService.addVeiculo(newVeiculoData as Omit<Veiculos, 'id'>);
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
