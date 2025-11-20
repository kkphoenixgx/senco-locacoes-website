import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import Veiculo from '../../model/items/Veiculos';

@Component({
  selector: 'app-card-product',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './card-product.html',
  styleUrl: './card-product.scss',
})
export class CardProduct {
  @Input() veiculo!: Veiculo;
  @Input() buttonText = 'Ver Detalhes';
  @Input() buttonLink = '/';

  isFlipped = signal(false);

  flipCard() {
    this.isFlipped.set(!this.isFlipped());
  }

  get infoType(): 'price' | 'category' {
    return 'price';
  }
}
