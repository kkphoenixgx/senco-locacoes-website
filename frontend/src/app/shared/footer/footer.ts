import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { WhatsappFloatingButton } from '../whatsapp-floating-button/whatsapp-floating-button';
import { ContactService } from '../../services/contact.service';
import { AuthService } from '../../services/auth.service';

import { ClientesService } from '../../services/clientes.service';
import { ContactInfoBlock } from '../../components/contact-info-block/contact-info-block';

@Component({
  selector: 'app-footer',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WhatsappFloatingButton,
    ContactInfoBlock
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer implements OnInit {
  private contactService = inject(ContactService);
  private authService = inject(AuthService);
  private clientesService = inject(ClientesService);

  isLoading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  contactForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    message: new FormControl('', [Validators.required]),
    subject: new FormControl('Contato via Rodapé'), // Assunto fixo
  });

  ngOnInit(): void {
    const authState = this.authService.authState();
    if (authState.isAuthenticated && authState.role === 'client') {
      this.clientesService.getProfile().subscribe(cliente => {
        this.contactForm.patchValue({
          name: cliente.nome,
          email: cliente.email
        });
      });
    }
  }

  onSubmit() {
    if (this.contactForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.contactService.sendMessage(this.contactForm.value as any)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.successMessage.set(res.message);
          setTimeout(() => this.successMessage.set(null), 5000); // Reseta a mensagem após 5 segundos
        },
        error: (err) => this.errorMessage.set(err.error?.message || 'Ocorreu um erro ao enviar a mensagem.'),
      });
  }
}
