import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-card-product',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './card-product.html',
  styleUrl: './card-product.scss',
})
export class CardProduct {
  @Input() imagePlaceholder = 'Produto';
  @Input() title = 'Nome do Produto';
  @Input() info = '';
  @Input() infoType: 'price' | 'category' = 'category';
  @Input() buttonText = 'Ver Detalhes';
  @Input() buttonLink = '/';

  get isPrice(): boolean {
    return this.infoType === 'price';
  }
}
