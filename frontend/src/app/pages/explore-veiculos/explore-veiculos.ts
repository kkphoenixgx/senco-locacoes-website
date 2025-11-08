import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardProduct } from '../../components/card-product/card-product';
import { VeiculosService } from '../../services/veiculos.service';
import { Observable } from 'rxjs';
import Veiculos from '../../model/items/Veiculos';
import { SectionHeader } from '../../components/section-header/section-header';

@Component({
  selector: 'app-explore-veiculos',
  imports: [CommonModule, CardProduct, SectionHeader],
  templateUrl: './explore-veiculos.html',
  styleUrl: './explore-veiculos.scss',
})
export class ExploreVeiculos implements OnInit {
  private veiculosService = inject(VeiculosService);
  veiculos$!: Observable<Veiculos[]>;
  isFilterOpen = signal(false);

  ngOnInit(): void {
    this.veiculos$ = this.veiculosService.getVeiculos();
  }

  toggleFilters() {
    this.isFilterOpen.set(!this.isFilterOpen());
  }
}
