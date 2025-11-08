import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardProduct } from '../../components/card-product/card-product';
import { FerramentasService } from '../../services/ferramentas.service';
import { CategoriasService } from '../../services/categorias.service';
import { Observable } from 'rxjs';
import Ferramentas from '../../model/items/Ferramentas';
import CategoriaFerramentas from '../../model/items/CategoriaFerramentas';
import { SectionHeader } from '../../components/section-header/section-header';

@Component({
  selector: 'app-explore-ferramentas',
  imports: [CommonModule, CardProduct, SectionHeader],
  templateUrl: './explore-ferramentas.html',
  styleUrl: './explore-ferramentas.scss',
})
export class ExploreFerramentas implements OnInit {
  private ferramentasService = inject(FerramentasService);
  private categoriasService = inject(CategoriasService);

  ferramentas$!: Observable<Ferramentas[]>;
  categorias$!: Observable<CategoriaFerramentas[]>;
  isFilterOpen = signal(false);

  ngOnInit(): void {
    this.ferramentas$ = this.ferramentasService.getFerramentas();
    this.categorias$ = this.categoriasService.getCategoriasFerramentas();
  }

  toggleFilters() {
    this.isFilterOpen.set(!this.isFilterOpen());
  }
}
