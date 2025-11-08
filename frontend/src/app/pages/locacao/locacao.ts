import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { DefaultFormInput } from '../../components/default-form-input/default-form-input';
import { DefaultFormTextArea } from '../../components/default-form-text-area/default-form-text-area';
import { SectionHeader } from '../../components/section-header/section-header';

@Component({
  selector: 'app-locacao',
  imports: [ReactiveFormsModule, DefaultFormTextArea, SectionHeader],
  templateUrl: './locacao.html',
  styleUrl: './locacao.scss',
})
export class Locacao {
  // FormGroup to manage the form controls.
  // This is a placeholder and can be expanded with validators.
  locacaoForm = new FormGroup({
    fullName: new FormControl(''),
    email: new FormControl(''),
    phone: new FormControl(''),
    company: new FormControl(''),
    equipment: new FormControl(''),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    location: new FormControl(''),
    message: new FormControl(''),
  });

  onSubmit() {
    // Placeholder for form submission logic
    console.log('Form Submitted!', this.locacaoForm.value);
  }
}
