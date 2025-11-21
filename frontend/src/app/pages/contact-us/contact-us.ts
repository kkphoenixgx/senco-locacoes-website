import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { SectionSubheader } from '../../components/section-subheader/section-subheader';
import { ContactInfoBlock } from '../../components/contact-info-block/contact-info-block';
import { DefaultButton } from '../../components/default-button/default-button';
import { DefaultFormInput } from '../../components/default-form-input/default-form-input';
import { DefaultFormTextArea } from '../../components/default-form-text-area/default-form-text-area';
import { SectionHeader } from '../../components/section-header/section-header';
import { ContactService } from '../../services/contact.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-contact-us',
  imports: [CommonModule, ReactiveFormsModule, SectionSubheader, ContactInfoBlock, DefaultButton, DefaultFormInput, DefaultFormTextArea, SectionHeader],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.scss',
})
export class ContactUs implements OnInit {
  private contactService = inject(ContactService);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  contactForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
    subject: new FormControl('', [Validators.required]),
    message: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const veiculoAssunto = params.get('veiculo');
      if (veiculoAssunto) {
        this.contactForm.patchValue({
          subject: `Interesse no veículo: ${veiculoAssunto}`
        });
      }
    });
  }

  onSubmit() {
    this.contactForm.markAllAsTouched();
    if (this.contactForm.invalid) {
      this.errorMessage.set('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.contactService.sendMessage(this.contactForm.value as any)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.successMessage.set(response.message);
          this.contactForm.reset();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Ocorreu um erro ao enviar a mensagem.');
        }
      });
  }
}
