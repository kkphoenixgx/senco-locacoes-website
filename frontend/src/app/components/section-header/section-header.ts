import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [CommonModule ],
  templateUrl: './section-header.html',
  styleUrl: './section-header.scss',
})
export class SectionHeader {
  @Input() title = 'Título da Seção';
  @Input() textAlign: 'left' | 'center' | 'right' = 'left';
  @Input() color?: string;
}
