import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendasService } from '../../../../core/services/vendas.service';

@Component({
  selector: 'app-adm-dashboard-vendas',
  imports: [CommonModule],
  templateUrl: './adm-dashboard-vendas.html',
  styleUrl: './adm-dashboard-vendas.scss',
})
export class AdmDashboardVendas {
  private vendasService = inject(VendasService);
  vendas = this.vendasService.vendas;
}
