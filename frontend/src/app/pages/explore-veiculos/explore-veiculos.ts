import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { CardProduct } from '../../components/card-product/card-product';
import { VeiculosService } from '../../services/veiculos.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import Veiculo from '../../model/items/Veiculos';
import { SectionHeader } from '../../components/section-header/section-header';
import { FormsModule } from '@angular/forms';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

interface VehicleFilters {
  nome: string | null;
  marca: string | null;
  ano: number | null;
  precoMin: number | null;
  precoMax: number | null;
}

@Component({
  selector: 'app-explore-veiculos',
  imports: [CommonModule, CardProduct, SectionHeader, FormsModule],
  templateUrl: './explore-veiculos.html',
  styleUrl: './explore-veiculos.scss',
})
export class ExploreVeiculos implements OnInit {
  private veiculosService = inject(VeiculosService);
  
  private allVeiculos$ = new BehaviorSubject<Veiculo[]>([]);
  filteredVeiculos$!: Observable<Veiculo[]>;
  marcas$!: Observable<string[]>;
  anos$!: Observable<number[]>;

  isFilterOpen = signal(false);

  public filterChanges$ = new BehaviorSubject<VehicleFilters>({
    nome: null,
    marca: null,
    ano: null,
    precoMin: null,
    precoMax: null,
  });

  ngOnInit(): void {
    this.veiculosService.getVeiculos().subscribe(veiculos => {
      this.allVeiculos$.next(veiculos);
    });

    this.marcas$ = this.allVeiculos$.pipe(
      map(veiculos => [...new Set(veiculos.map(v => v.marca).filter(Boolean) as string[])].sort())
    );
    this.anos$ = this.allVeiculos$.pipe(
      map(veiculos => [...new Set(veiculos.map(v => v.anoFabricacao).filter(Boolean) as number[])].sort((a, b) => b - a))
    );

    this.filteredVeiculos$ = combineLatest([
      this.allVeiculos$,
      this.filterChanges$.pipe(debounceTime(300), distinctUntilChanged())
    ])
      .pipe(
        map(([veiculos, filters]) => 
          veiculos.filter(veiculo => {
            const nomeMatch = !filters.nome || veiculo.titulo.toLowerCase().includes(filters.nome.toLowerCase());
            const marcaMatch = !filters.marca || veiculo.marca === filters.marca;
            const anoMatch = !filters.ano || veiculo.anoFabricacao === Number(filters.ano);
            const precoMinMatch = !filters.precoMin || veiculo.preco >= filters.precoMin;
            const precoMaxMatch = !filters.precoMax || veiculo.preco <= filters.precoMax;
            
            return nomeMatch && marcaMatch && anoMatch && precoMinMatch && precoMaxMatch;
          })
        )
      );
  }

  onFilterChange<K extends keyof VehicleFilters>(filterName: K, value: VehicleFilters[K]): void {
    const currentFilters = this.filterChanges$.getValue();
    this.filterChanges$.next({ ...currentFilters, [filterName]: value });
  }

  toggleFilters() {
    this.isFilterOpen.set(!this.isFilterOpen());
  }
}
