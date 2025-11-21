import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ClientesService } from '../../services/clientes.service';
import { SectionHeader } from '../../components/section-header/section-header';
import { SectionSubheader } from '../../components/section-subheader/section-subheader';
import { DefaultFormInput } from '../../components/default-form-input/default-form-input';
import { DefaultButton } from '../../components/default-button/default-button';

@Component({
  selector: 'app-minha-conta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SectionHeader, SectionSubheader, DefaultFormInput, DefaultButton],
  templateUrl: './minha-conta.html',
  styleUrls: ['./minha-conta.scss']
})
export class MinhaContaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientesService = inject(ClientesService);

  profileForm!: FormGroup;
  isLoading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      nome: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      telefone: [''],
      endereco: ['']
    });

    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.clientesService.getProfile()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (cliente) => this.profileForm.patchValue(cliente),
        error: (err) => this.errorMessage.set(err.error?.message || 'Não foi possível carregar seus dados.')
      });
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.profileForm.dirty) return;

    this.isLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.clientesService.updateProfile(this.profileForm.getRawValue())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Seus dados foram atualizados com sucesso!');
          this.profileForm.markAsPristine(); // Marca o form como "limpo" após salvar
        },
        error: (err) => this.errorMessage.set(err.error?.message || 'Ocorreu um erro ao atualizar seus dados.')
      });
  }
}