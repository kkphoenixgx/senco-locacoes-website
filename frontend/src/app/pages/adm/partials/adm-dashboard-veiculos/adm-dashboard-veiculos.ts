import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, finalize, Observable, switchMap, tap } from 'rxjs';
import Veiculo from '../../../../model/items/Veiculos';
import { VeiculosService } from '../../../../services/veiculos.service';
import { SectionHeader } from '../../../../components/section-header/section-header';
import { DefaultButton } from '../../../../components/default-button/default-button';
import { DefaultFormInput } from '../../../../components/default-form-input/default-form-input';
import { DefaultFormTextArea } from '../../../../components/default-form-text-area/default-form-text-area';
import { CategoriasService } from '../../../../services/categorias.service';
import CategoriaVeiculos from '../../../../model/items/CategoriaVeiculos';


@Component({
  selector: 'app-adm-dashboard-veiculos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SectionHeader,
    DefaultButton,
    DefaultFormInput,
    DefaultFormTextArea
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
      imagens: [null, Validators.required] // Apenas para validação
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
      // Atualiza o valor do controle para satisfazer o validador 'required'
      this.veiculoForm.get('imagens')?.setValue(this.selectedFiles.length > 0 ? this.selectedFiles : null);
    }
  }

  onAddNew(): void {
    this.editingVeiculoId.set(null);
    this.veiculoForm.reset();
    this.showForm.set(true);
    // Re-adiciona o validador de imagem para o modo de criação
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

    const id = this.editingVeiculoId();
    const veiculoData = this.veiculoForm.value;
    let action$: Observable<Veiculo>;

    if (id) {
      // Modo de Edição
      // O backend não suporta atualização de imagem, então removemos o campo.
      delete veiculoData.imagens;
      action$ = this.veiculosService.updateVeiculo(id, veiculoData);
    } else {
      // Modo de Criação
      // Omitimos 'imagens' do form, pois ele será enviado separadamente como File[]
      const { imagens, ...createData } = veiculoData;
      action$ = this.veiculosService.createVeiculo(createData, this.selectedFiles);
    }

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

    // Remove o validador de imagem para o modo de edição, pois não vamos atualizá-las
    this.veiculoForm.get('imagens')?.clearValidators();
    this.veiculoForm.get('imagens')?.updateValueAndValidity();

    this.veiculoForm.patchValue({
      ...veiculo,
      // O backend espera categoriaId, não o objeto categoria
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
          this.refreshVeiculos$.next(); // Atualiza a lista
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