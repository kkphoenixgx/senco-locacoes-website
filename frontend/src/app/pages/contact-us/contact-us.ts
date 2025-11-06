import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-contact-us',
  imports: [ReactiveFormsModule],
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
