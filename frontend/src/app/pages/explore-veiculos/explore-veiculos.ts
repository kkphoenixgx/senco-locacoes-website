import { Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-explore-veiculos',
  imports: [NgClass],
  templateUrl: './explore-veiculos.html',
  styleUrl: './explore-veiculos.scss',
})
export class ExploreVeiculos {
  // Signal to control the visibility of the mobile filter drawer
  isFilterOpen = signal(false);

  // Toggles the state of the filter drawer
  toggleFilters() {
    this.isFilterOpen.set(!this.isFilterOpen());
  }
}
