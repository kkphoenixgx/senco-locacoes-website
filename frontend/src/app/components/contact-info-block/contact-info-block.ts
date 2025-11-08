import { Component } from '@angular/core';
import { SectionSubheader } from '../section-subheader/section-subheader';

@Component({
  selector: 'app-contact-info-block',
  standalone: true,
  imports: [SectionSubheader],
  templateUrl: './contact-info-block.html',
  styleUrl: './contact-info-block.scss',
})
export class ContactInfoBlock {}
