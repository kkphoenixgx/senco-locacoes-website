import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, finalize, Observable, switchMap, tap } from 'rxjs';
import Veiculo from '../../../../model/items/Veiculos';
import { VeiculosService } from '../../../../services/veiculos.service';
import { SectionHeader } from '../../../../components/section-header/section-header';
import { DefaultButton } from '../../../../components/default-button/default-button';
import { CategoriasService } from '../../../../services/categorias.service';
import CategoriaVeiculos from '../../../../model/items/CategoriaVeiculos';
// import { DefaultFormInput } from '../../../../components/default-form-input/default-form-input';
// import { DefaultFormTextArea } from '../../../../components/default-form-text-area/default-form-text-area';


@Component({
  selector: 'app-adm-dashboard-veiculos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SectionHeader,
    DefaultButton,
    // DefaultFormInput,
    // DefaultFormTextArea
  ],
  templateUrl: './adm-dashboard-veiculos.html',
  styleUrls: ['./adm-dashboard-veiculos.scss']
})
export class AdmDashboardVeiculosComponent implements OnInit {
  private veiculosService = inject(VeiculosService);
  private categoriasService = inject(CategoriasService);
  private fb = inject(FormBuilder);

  private refreshVeiculos$ = new BehaviorSubject<void>(undefined);

  public veiculos$!: Observable<Veiculo[]>;
  public categorias$!: Observable<CategoriaVeiculos[]>;
  public veiculoForm!: FormGroup;
  private selectedFiles: File[] = [];

  public showForm = signal(false);
  public editingVeiculoId = signal<number | null>(null);
  public isLoading = signal(false);
  public errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.veiculos$ = this.refreshVeiculos$.pipe(
      switchMap(() => this.veiculosService.getVeiculos())
    );
    
    this.categorias$ = this.categoriasService.getCategorias();

    this.veiculoForm = this.fb.group({
      titulo: ['', Validators.required],
      preco: ['', [Validators.required, Validators.min(0)]],
      descricao: [''],
      categoriaId: [null, Validators.required],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      anoFabricacao: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      anoModelo: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      quilometragem: ['', [Validators.required, Validators.min(0)]],
      cor: ['', Validators.required],
      documentacao: [''],
      revisoes: [''],
      imagens: [null, Validators.required]
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);

      this.veiculoForm.get('imagens')?.setValue(this.selectedFiles.length > 0 ? this.selectedFiles : null);
    }
  }

  onAddNew(): void {
    this.editingVeiculoId.set(null);
    this.veiculoForm.reset();
    this.showForm.set(true);

    this.veiculoForm.get('imagens')?.setValidators([Validators.required]);
    this.veiculoForm.get('imagens')?.updateValueAndValidity();
    this.errorMessage.set(null);
  }

  onCancel(): void {
    this.showForm.set(false);
    this.errorMessage.set(null);
  }

  onSave(): void {
    this.veiculoForm.markAllAsTouched();
    if (this.veiculoForm.invalid) {
      this.errorMessage.set('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formData = new FormData();

    const veiculoData = this.veiculoForm.value;
    for (const key in veiculoData) {
      if (veiculoData.hasOwnProperty(key) && key !== 'imagens') {
        formData.append(key, veiculoData[key]);
      }
    }

    this.selectedFiles.forEach(file => {
      formData.append('imagens', file, file.name);
    });

    const id = this.editingVeiculoId();

    const action$: Observable<Veiculo> = id
      ? this.veiculosService.updateVeiculo(id, formData)
      : this.veiculosService.createVeiculo(formData);
    action$
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: () => {
          this.showForm.set(false);
          this.refreshVeiculos$.next();
        },
        error: (err) => {
          console.error('Erro ao salvar veículo:', err);
          this.errorMessage.set(err.error?.message || 'Ocorreu um erro ao salvar o veículo. Tente novamente.');
        }
      });
  }

  onEdit(veiculo: Veiculo): void {
    this.editingVeiculoId.set(veiculo.id);
    this.errorMessage.set(null);

    this.veiculoForm.get('imagens')?.clearValidators();
    this.veiculoForm.get('imagens')?.updateValueAndValidity();

    this.veiculoForm.patchValue({
      ...veiculo,
      categoriaId: veiculo.categoria?.id
    });

    this.showForm.set(true);
  }

  onDelete(id: number): void {
    const confirmDelete = confirm('Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.');
    if (!confirmDelete) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.veiculosService.deleteVeiculo(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.refreshVeiculos$.next();
        },
        error: (err) => {
          console.error('Erro ao excluir veículo:', err);
          this.errorMessage.set(err.error?.message || 'Ocorreu um erro ao excluir o veículo.');
        }
      });
  }

  getFormControl(name: string): FormControl {
    return this.veiculoForm.get(name) as FormControl;
  }
}