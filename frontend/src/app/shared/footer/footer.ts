import { Component } from '@angular/core';
import { WhatsappFloatingButton } from '../whatsapp-floating-button/whatsapp-floating-button';

@Component({
  selector: 'app-footer',
  imports: [WhatsappFloatingButton],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {}
