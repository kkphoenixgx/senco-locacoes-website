import { Component } from '@angular/core';
import { SectionSubheader } from '../section-subheader/section-subheader';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-info-block',
  standalone: true,
  imports: [CommonModule, SectionSubheader],
  templateUrl: './contact-info-block.html',
  styleUrl: './contact-info-block.scss',
})
export class ContactInfoBlock {}
