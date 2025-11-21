import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import Venda from '../../../../model/Venda';
import { VendasService } from '../../../../services/vendas.service';
import { SectionHeader } from '../../../../components/section-header/section-header';

@Component({
  selector: 'app-adm-dashboard-vendas',
  standalone: true,
  imports: [
    CommonModule,
    SectionHeader
  ],
  templateUrl: './adm-dashboard-vendas.html',
  styleUrls: ['./adm-dashboard-vendas.scss']
})
export class AdmDashboardVendasComponent implements OnInit {
  private vendasService = inject(VendasService);
  public vendas$!: Observable<Venda[]>;

  ngOnInit(): void {
    this.vendas$ = this.vendasService.getVendas();
  }
}