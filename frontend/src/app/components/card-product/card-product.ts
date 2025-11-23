import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { Router } from '@angular/router';
import Veiculo from '../../model/items/Veiculos';
import { AuthService } from '../../services/auth.service';
import { DefaultButton } from '../default-button/default-button';

@Component({
  selector: 'app-card-product',
  standalone: true,
  imports: [CommonModule, DefaultButton],
  templateUrl: './card-product.html',
  styleUrl: './card-product.scss',
})
export class CardProduct {
  authService = inject(AuthService);
  router = inject(Router);
  
  @Input() veiculo!: Veiculo;
  @Output() purchaseRequest = new EventEmitter<number>();

  isFlipped = signal(false);

  flipCard() {
    this.isFlipped.set(!this.isFlipped());
  }

  onPurchaseClick(event: MouseEvent) {
    event.stopPropagation();
    if (this.authService.isCliente()) {
      this.router.navigate(['/comprar', this.veiculo.id]);
    } else {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/comprar/${this.veiculo.id}` },
      });
    }
  }
}
