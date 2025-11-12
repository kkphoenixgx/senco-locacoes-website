import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-widget',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './image-widget.html',
  styleUrl: './image-widget.scss',
})
export class ImageWidget {
  @Input() src?: string;
  @Input() placeholderText = 'Imagem';
}
