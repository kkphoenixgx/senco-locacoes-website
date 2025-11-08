import { NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './section-header.html',
  styleUrl: './section-header.scss',
})
export class SectionHeader {
  @Input() title = 'Título da Seção';
  @Input() textAlign: 'left' | 'center' | 'right' = 'left';
}
