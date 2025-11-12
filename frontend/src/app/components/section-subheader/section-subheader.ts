import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-subheader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-subheader.html',
  styleUrl: './section-subheader.scss',
})
export class SectionSubheader {
  @Input() title = 'Subtítulo da Seção';
}
