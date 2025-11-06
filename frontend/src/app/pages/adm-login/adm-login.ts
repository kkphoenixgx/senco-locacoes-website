import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-adm-login',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './adm-login.html',
  styleUrl: './adm-login.scss',
})
export class AdmLogin {
  private router = inject(Router);

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

    // Lógica de autenticação (placeholder)
    // Em uma aplicação real, você chamaria um AuthService aqui.
    const { email, password } = this.loginForm.getRawValue();

    // Simula uma chamada de API
    setTimeout(() => {
      if (email === 'admin@senco.com' && password === 'password') {
        localStorage.setItem('admin-token', 'your-secure-token-here');
        this.router.navigate(['/adm']);
      } else {
        this.errorMessage.set('Credenciais inválidas. Tente novamente.');
      }
      this.isLoading.set(false);
    }, 1000);
  }
}
