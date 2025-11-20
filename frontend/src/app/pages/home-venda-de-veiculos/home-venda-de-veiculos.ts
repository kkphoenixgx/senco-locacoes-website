import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardProduct } from '../../components/card-product/card-product';
import { VeiculosService } from '../../services/veiculos.service';
import { Observable } from 'rxjs';
import Veiculos from '../../model/items/Veiculos';
import { CommonModule } from '@angular/common';
import { FeaturedCard } from '../../components/featured-card/featured-card';
import { SectionHeader } from '../../components/section-header/section-header';
import { DefaultButton } from '../../components/default-button/default-button';

@Component({
  selector: 'app-home-venda-de-veiculos',
  imports: [RouterLink, CardProduct, CommonModule, FeaturedCard, SectionHeader, DefaultButton],
  templateUrl: './home-venda-de-veiculos.html',
  styleUrl: './home-venda-de-veiculos.scss',
})
export class HomeVendaDeVeiculos implements OnInit {
  private veiculosService = inject(VeiculosService);
  veiculos$!: Observable<Veiculos[]>;

  ngOnInit(): void {
    this.veiculos$ = this.veiculosService.getVeiculos();
  }
}
