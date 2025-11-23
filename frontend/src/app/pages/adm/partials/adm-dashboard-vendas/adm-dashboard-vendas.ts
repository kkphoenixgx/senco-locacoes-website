import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, tap } from 'rxjs';
import Venda from '../../../../model/Venda';
import { VendasService } from '../../../../services/vendas.service';
import { SectionHeader } from '../../../../components/section-header/section-header';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-adm-dashboard-vendas',
  standalone: true,
  imports: [
    CommonModule,
    SectionHeader,
    RouterLink
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

  toggleStatus(venda: Venda): void {
    const novoStatus = !venda.efetivada;
    this.vendasService.updateStatus(venda.id, novoStatus).subscribe({
      next: () => {
        // Atualiza a lista de vendas para refletir a mudança
        this.vendas$ = this.vendasService.getVendas();
      },
      error: (err) => {
        console.error('Erro ao atualizar status da venda', err);
        // Adicionar feedback de erro para o usuário se necessário
      }
    });
  }

  deleteVenda(id: number): void {
    if (confirm('Tem certeza que deseja deletar esta venda? Esta ação não pode ser desfeita.')) {
      this.vendasService.deleteVenda(id).subscribe({
        next: () => {
          this.vendas$ = this.vendasService.getVendas();
        }
      });
    }
  }
}