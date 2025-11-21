import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import Veiculo from '../../model/items/Veiculos';
import { AuthService } from '../../services/auth.service';
import { DefaultButton } from '../default-button/default-button';

@Component({
  selector: 'app-card-product',
  standalone: true,
  imports: [RouterLink, CommonModule, DefaultButton],
  templateUrl: './card-product.html',
  styleUrl: './card-product.scss',
})
export class CardProduct {
  authService = inject(AuthService);

  @Input() veiculo!: Veiculo;
  @Output() purchaseRequest = new EventEmitter<number>();

  isFlipped = signal(false);

  flipCard() {
    this.isFlipped.set(!this.isFlipped());
  }

  onPurchaseClick(event: MouseEvent) {
    event.stopPropagation(); // Evita que o card vire ao clicar no botão
    this.purchaseRequest.emit(this.veiculo.id);
  }
}
