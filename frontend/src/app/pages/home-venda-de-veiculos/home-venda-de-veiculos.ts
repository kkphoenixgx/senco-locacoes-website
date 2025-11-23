import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardProduct } from '../../components/card-product/card-product';
import { VeiculosService } from '../../services/veiculos.service'; 
import { finalize } from 'rxjs';
import Veiculo from '../../model/items/Veiculos';
import { CommonModule } from '@angular/common';
import { FeaturedCard } from '../../components/featured-card/featured-card';
import { SectionHeader } from '../../components/section-header/section-header';
import { DefaultButton } from '../../components/default-button/default-button';
import { PurchaseService } from '../../services/purchase.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-home-venda-de-veiculos', // O seletor está correto
  imports: [RouterLink, CardProduct, CommonModule, FeaturedCard, SectionHeader, DefaultButton],
  templateUrl: './home-venda-de-veiculos.html',
  styleUrl: './home-venda-de-veiculos.scss',
})
export class HomeVendaDeVeiculos implements OnInit {
  private veiculosService = inject(VeiculosService);
  private purchaseService = inject(PurchaseService);
  private notificationService = inject(NotificationService);

  public veiculos = signal<Veiculo[]>([]); // Para a lista geral
  public maisVendidos = signal<Veiculo[]>([]); // Para os mais vendidos
  public isLoading = signal(true);
  public error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadVeiculos();
    this.loadMaisVendidos();
  }

  loadVeiculos(): void {
    this.isLoading.set(true);
    this.veiculosService.getVeiculos().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (data) => this.veiculos.set(data),
      error: (err) => this.error.set('Falha ao carregar veículos. Tente novamente mais tarde.')
    });
  }

  loadMaisVendidos(): void {
    this.veiculosService.getVeiculosMaisVendidos().subscribe({
      next: (data) => this.maisVendidos.set(data),
      error: (err) => this.error.set('Falha ao carregar veículos. Tente novamente mais tarde.')
    });
  }

  handlePurchaseRequest(vehicleId: number) {
    this.purchaseService.requestPurchase(vehicleId).subscribe({
      next: (response) => {
        this.notificationService.show('Sua solicitação de compra foi enviada com sucesso!', 'success');
      },
      error: (err) => this.notificationService.show(err.error?.message || 'Não foi possível completar a solicitação.', 'error')
    });
  }
}
