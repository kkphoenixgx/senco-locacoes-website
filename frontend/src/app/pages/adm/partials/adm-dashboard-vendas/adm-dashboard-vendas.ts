import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendasService } from '../../../../services/vendas.service';
import Venda from '../../../../model/Venda';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-adm-dashboard-vendas',
  imports: [CommonModule],
  templateUrl: './adm-dashboard-vendas.html',
  styleUrl: './adm-dashboard-vendas.scss',
})
export class AdmDashboardVendas implements OnInit {
  private vendasService = inject(VendasService);
  vendas$!: Observable<Venda[]>;

  ngOnInit(): void {
    this.vendas$ = this.vendasService.getVendas();
  }
}
