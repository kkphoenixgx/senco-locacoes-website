import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { CardProduct } from '../../components/card-product/card-product';
import { VeiculosService } from '../../services/veiculos.service';
import { BehaviorSubject, combineLatest, EMPTY, Observable, of } from 'rxjs';
import Veiculo from '../../model/items/Veiculos'; // This seems to be a model class, not from a component
import { SectionHeader } from '../../components/section-header/section-header';
import { FormsModule } from '@angular/forms';
import { map, startWith, debounceTime, distinctUntilChanged, switchMap, tap, scan, catchError } from 'rxjs/operators';
import localePt from '@angular/common/locales/pt';
import { PurchaseService } from '../../services/purchase.service';
import { DefaultButton } from '../../components/default-button/default-button';
import { NotificationService } from '../../services/notification.service';

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
  imports: [CommonModule, CardProduct, SectionHeader, FormsModule, DefaultButton],
  templateUrl: './explore-veiculos.html',
  styleUrl: './explore-veiculos.scss',
})
export class ExploreVeiculos implements OnInit {
  private readonly PAGE_SIZE = 12;
  private veiculosService = inject(VeiculosService);
  private purchaseService = inject(PurchaseService);
  private notificationService = inject(NotificationService);
  
  private allVeiculos$ = new BehaviorSubject<Veiculo[]>([]); // Mantém a lista de marcas e anos
  
  veiculos = signal<Veiculo[]>([]);
  isLoading = signal(false);
  hasMoreVehicles = signal(true);
  error = signal<string | null>(null);
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
  
  private page$ = new BehaviorSubject<number>(1);

  // Computeds para o template
  hasVehicles = computed(() => this.veiculos().length > 0);
  showEmptyState = computed(() => !this.hasVehicles() && !this.isLoading() && !this.error());

  ngOnInit(): void {
    // Carrega todos os veículos uma vez para popular os filtros de marca e ano
    this.veiculosService.getVeiculos().subscribe(all => this.allVeiculos$.next(all));

    this.marcas$ = this.allVeiculos$.pipe(
      map(veiculos => [...new Set(veiculos.map(v => v.marca).filter(Boolean) as string[])].sort())
    );
    this.anos$ = this.allVeiculos$.pipe(
      map(veiculos => [...new Set(veiculos.map(v => v.anoFabricacao).filter(Boolean) as number[])].sort((a, b) => b - a))
    );
    
    // Stream principal que reage a mudanças de filtros e de página
    combineLatest([
      this.filterChanges$.pipe(debounceTime(300), distinctUntilChanged()),
      this.page$
    ]).pipe(
      tap(([filters, page]) => {
        if (page === 1) this.veiculos.set([]); // Limpa a lista se for uma nova busca (filtros mudaram)
        this.isLoading.set(true);
        this.error.set(null);
      }),
      switchMap(([filters, page]) => 
        this.veiculosService.getVeiculos({ ...filters, page, limit: this.PAGE_SIZE }).pipe(
          catchError(err => {
            this.error.set('Não foi possível carregar os veículos. Verifique sua conexão e tente novamente.');
            return of([]);
          })
        )
      )
    ).subscribe(newVeiculos => {
      this.hasMoreVehicles.set(newVeiculos.length === this.PAGE_SIZE && !this.error());
      this.veiculos.update(current => [...current, ...newVeiculos]);
      this.isLoading.set(false);
    });
  }

  onFilterChange<K extends keyof VehicleFilters>(filterName: K, value: VehicleFilters[K]): void {
    const currentFilters = this.filterChanges$.getValue();
    const newFilters = { ...currentFilters, [filterName]: value };
    this.filterChanges$.next(newFilters);
    
    // Quando um filtro muda, reseta a paginação para o início
    if (this.page$.getValue() !== 1) {
      this.page$.next(1);
    } else {
      // Se já estiver na página 1, força a atualização
      this.veiculos.set([]);
      this.isLoading.set(true);
      this.error.set(null);
      this.veiculosService.getVeiculos({ ...newFilters, page: 1, limit: this.PAGE_SIZE }).subscribe();
    }
  }

  loadMore(): void {
    if (!this.isLoading() && this.hasMoreVehicles()) {
      this.page$.next(this.page$.getValue() + 1);
    }
  }

  toggleFilters() {
    this.isFilterOpen.set(!this.isFilterOpen());
  }

  handlePurchaseRequest(vehicleId: number) {
    this.purchaseService.requestPurchase(vehicleId).subscribe({
      next: () => {
        this.notificationService.show('Sua solicitação de compra foi enviada com sucesso!', 'success');
      },
      error: (err) => this.notificationService.show(err.error?.message || 'Não foi possível completar a solicitação.', 'error')
    });
  }
}
