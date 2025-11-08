import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FerramentasService } from '../../../../services/ferramentas.service';
import Ferramentas from '../../../../model/items/Ferramentas';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import CategoriaFerramentas from '../../../../model/items/CategoriaFerramentas';

@Component({
  selector: 'app-adm-dashboard-ferramentas',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adm-dashboard-ferramentas.html',
  styleUrl: './adm-dashboard-ferramentas.scss',
})
export class AdmDashboardFerramentas implements OnInit {
  private fb = inject(FormBuilder);
  private ferramentasService = inject(FerramentasService);

  ferramentas$!: Observable<Ferramentas[]>;
  showForm = signal(false);
  editingFerramentaId = signal<number | null>(null);

  ferramentaForm: FormGroup;

  constructor() {
    this.ferramentaForm = this.fb.group({
      // Adicionando todos os campos necessários para o modelo
      titulo: ['', Validators.required],
      preco: [0, [Validators.required, Validators.min(0)]],
      categoriaId: [null, Validators.required],
      descricao: [''],
    });
  }

  ngOnInit(): void {
    this.ferramentas$ = this.ferramentasService.getFerramentas();
  }

  onAddNew() {
    this.editingFerramentaId.set(null);
    this.ferramentaForm.reset();
    this.showForm.set(true);
  }

  onEdit(ferramenta: Ferramentas) {
    this.editingFerramentaId.set(ferramenta.id);
    this.ferramentaForm.setValue({
      titulo: ferramenta.titulo,
      preco: ferramenta.preco,
      categoriaId: ferramenta.categoriaId,
      descricao: ferramenta.descricao,
    });
    this.showForm.set(true);
  }

  onSave() {
    if (this.ferramentaForm.invalid) return;

    const id = this.editingFerramentaId();
    const formValue = this.ferramentaForm.value;

    if (id) {
      // For updates, create a new class instance with the form data and existing ID
      const updatedFerramenta = new Ferramentas(
        id,
        formValue.titulo,
        formValue.preco,
        formValue.descricao,
        [], // images placeholder
        formValue.categoriaId,
        'Marca Padrão', // placeholder
        'usada' // placeholder
      );
      this.ferramentasService.updateFerramenta(updatedFerramenta);
    } else {
      // For creation, the service will create the instance. We just need to pass the data.
      const newFerramentaData = {
        ...formValue,
        marca: 'Marca Padrão',
        condicao: 'usada',
        imagens: [],
      };

      // We cast to Omit to satisfy the service method signature
      this.ferramentasService.addFerramenta(newFerramentaData as Omit<Ferramentas, 'id'>);
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
