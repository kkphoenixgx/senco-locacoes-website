import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { SectionSubheader } from '../../components/section-subheader/section-subheader';
import { ContactInfoBlock } from '../../components/contact-info-block/contact-info-block';
import { DefaultButton } from '../../components/default-button/default-button';
import { DefaultFormInput } from '../../components/default-form-input/default-form-input';
import { DefaultFormTextArea } from '../../components/default-form-text-area/default-form-text-area';
import { MapFrame } from '../../components/map-frame/map-frame';
import { SectionHeader } from '../../components/section-header/section-header';


@Component({
  selector: 'app-contact-us',
  imports: [ReactiveFormsModule, SectionSubheader, ContactInfoBlock, DefaultButton, DefaultFormInput, DefaultFormTextArea, SectionHeader],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.scss',
})
export class ContactUs {
  contactForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    phone: new FormControl(''),
    subject: new FormControl(''),
    message: new FormControl(''),
  });

  onSubmit() {
    // Placeholder for form submission logic.
    // In a real application, you would send this data to a backend service.
    console.log('Contact form submitted:', this.contactForm.value);
  }
}
