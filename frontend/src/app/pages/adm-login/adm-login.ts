import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';
import { DefaultButton } from '../../components/default-button/default-button';
import { DefaultFormInput } from '../../components/default-form-input/default-form-input';

@Component({
  selector: 'app-adm-login',
  imports: [ReactiveFormsModule, NgIf, DefaultButton, DefaultFormInput, RouterLink],
  templateUrl: './adm-login.html',
  styleUrl: './adm-login.scss',
})
export class AdmLogin {
  private router = inject(Router);
  private authService = inject(AuthService);

  // Sinais para controle de estado da UI
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    // Marca os campos como "tocados" para exibir erros de validação
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.getRawValue();

    if (email && password) {
      this.authService
        .login(email, password)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: () => {
            this.router.navigate(['/adm']);
          },
          error: (err) => {
            this.errorMessage.set(err.message);
          },
        });
    }
  }
}
