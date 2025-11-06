import { Component, inject, OnInit, signal } from '@angular/core';
import { Ferramenta, FerramentasService } from '../../../../core/services/ferramentas.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-adm-dashboard-ferramentas',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adm-dashboard-ferramentas.html',
  styleUrl: './adm-dashboard-ferramentas.scss',
})
export class AdmDashboardFerramentas {
  private fb = inject(FormBuilder);
  private ferramentasService = inject(FerramentasService);

  // Signals for state management
  ferramentas = this.ferramentasService.ferramentas;
  showForm = signal(false);
  editingFerramentaId = signal<number | null>(null);

  ferramentaForm: FormGroup;

  constructor() {
    this.ferramentaForm = this.fb.group({
      nome: ['', Validators.required],
      categoria: ['', Validators.required],
      descricao: [''],
    });
  }

  onAddNew() {
    this.editingFerramentaId.set(null);
    this.ferramentaForm.reset();
    this.showForm.set(true);
  }

  onEdit(ferramenta: Ferramenta) {
    this.editingFerramentaId.set(ferramenta.id);
    this.ferramentaForm.setValue({
      nome: ferramenta.nome,
      categoria: ferramenta.categoria,
      descricao: ferramenta.descricao,
    });
    this.showForm.set(true);
  }

  onSave() {
    if (this.ferramentaForm.invalid) return;

    const id = this.editingFerramentaId();
    if (id) {
      this.ferramentasService.updateFerramenta({ id, ...this.ferramentaForm.value });
    } else {
      this.ferramentasService.addFerramenta(this.ferramentaForm.value);
    }
    this.showForm.set(false);
  }

  onDelete(id: number) {
    if (confirm('Tem certeza que deseja excluir esta ferramenta?')) {
      this.ferramentasService.deleteFerramenta(id);
    }
  }

  onCancel() {
    this.showForm.set(false);
  }
}
