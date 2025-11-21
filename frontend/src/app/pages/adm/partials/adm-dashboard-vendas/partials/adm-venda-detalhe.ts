import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import Venda from '../../../../../model/Venda';
import { VendasService } from '../../../../../services/vendas.service'; 
import { SectionHeader } from '../../../../../components/section-header/section-header'; 
import { DefaultButton } from '../../../../../components/default-button/default-button'; 

@Component({
  selector: 'app-adm-venda-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink, SectionHeader, DefaultButton],
  templateUrl: './adm-venda-detalhe.html',
  styleUrls: ['./adm-venda-detalhe.scss']
})
export class AdmVendaDetalheComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private vendasService = inject(VendasService);

  public venda$!: Observable<Venda | null>;

  ngOnInit(): void {
    this.venda$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          return this.vendasService.getVendaById(Number(id));
        }
        return of(null);
      }),
      catchError(() => of(null)) // Em caso de erro na API, retorna nulo para mostrar mensagem de erro
    );
  }
}