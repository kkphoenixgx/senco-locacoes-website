import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';
import { DefaultButton } from '../../components/default-button/default-button';
import { DefaultFormInput } from '../../components/default-form-input/default-form-input';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('senhaPlana');
  const confirmPassword = control.get('confirmarSenha');
  return password && confirmPassword && password.value !== confirmPassword.value ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DefaultButton, DefaultFormInput],
  templateUrl: './cadastro.html',
  styleUrls: ['./cadastro.scss']
})
export class CadastroComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  registerForm = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefone: [''],
    endereco: [''],
    senhaPlana: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  onSubmit() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { confirmarSenha, ...clienteData } = this.registerForm.getRawValue();

    this.authService.registerCliente(clienteData as any)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          // Após o cadastro, o usuário já é logado pelo serviço, então redirecionamos para a home
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Ocorreu um erro ao realizar o cadastro.');
        }
      });
  }
}