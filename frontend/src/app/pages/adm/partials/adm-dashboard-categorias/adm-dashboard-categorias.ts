import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, finalize, Observable, switchMap } from 'rxjs';
import CategoriaVeiculos from '../../../../model/items/CategoriaVeiculos';
import { CategoriasService } from '../../../../services/categorias.service';
import { SectionHeader } from '../../../../components/section-header/section-header';
import { DefaultButton } from '../../../../components/default-button/default-button';
import { DefaultFormInput } from '../../../../components/default-form-input/default-form-input';
import { DefaultFormTextArea } from '../../../../components/default-form-text-area/default-form-text-area';

@Component({
  selector: 'app-adm-dashboard-categorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SectionHeader, DefaultButton, DefaultFormInput, DefaultFormTextArea],
  templateUrl: './adm-dashboard-categorias.html',
  styleUrls: ['./adm-dashboard-categorias.scss']
})
export class AdmDashboardCategoriasComponent implements OnInit {
  private categoriasService = inject(CategoriasService);
  private fb = inject(FormBuilder);

  private refreshCategorias$ = new BehaviorSubject<void>(undefined);
  public categorias$!: Observable<CategoriaVeiculos[]>;
  public categoriaForm!: FormGroup;

  public showForm = signal(false);
  public editingCategoriaId = signal<number | null>(null);
  public isLoading = signal(false);
  public errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.categorias$ = this.refreshCategorias$.pipe(
      switchMap(() => this.categoriasService.getCategorias())
    );

    this.categoriaForm = this.fb.group({
      nome: ['', Validators.required],
      descricao: ['']
    });
  }

  onAddNew(): void {
    this.editingCategoriaId.set(null);
    this.categoriaForm.reset();
    this.showForm.set(true);
    this.errorMessage.set(null);
  }

  onEdit(categoria: CategoriaVeiculos): void {
    this.editingCategoriaId.set(categoria.id);
    this.categoriaForm.patchValue(categoria);
    this.showForm.set(true);
    this.errorMessage.set(null);
  }

  onCancel(): void {
    this.showForm.set(false);
    this.errorMessage.set(null);
  }

  onSave(): void {
    if (this.categoriaForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const id = this.editingCategoriaId();
    const action$ = id
      ? this.categoriasService.updateCategoria(id, this.categoriaForm.value)
      : this.categoriasService.createCategoria(this.categoriaForm.value);

    action$.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => {
        this.showForm.set(false);
        this.refreshCategorias$.next();
      },
      error: (err) => this.errorMessage.set(err.error?.message || 'Ocorreu um erro ao salvar a categoria.')
    });
  }

  onDelete(id: number): void {
    if (!confirm('Tem certeza que deseja excluir esta categoria? A ação não pode ser desfeita e só funcionará se a categoria não estiver em uso.')) {
      return;
    }

    this.categoriasService.deleteCategoria(id).subscribe({
      next: () => this.refreshCategorias$.next(),
      error: (err) => {
        alert(err.error?.message || 'Ocorreu um erro ao excluir a categoria.');
        console.error('Erro ao excluir categoria:', err);
      }
    });
  }
}