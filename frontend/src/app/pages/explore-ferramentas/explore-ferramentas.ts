import { Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-explore-ferramentas',
  imports: [NgClass],
  templateUrl: './explore-ferramentas.html',
  styleUrl: './explore-ferramentas.scss',
})
export class ExploreFerramentas {
  // Signal to control the visibility of the mobile filter drawer
  isFilterOpen = signal(false);

  // Toggles the state of the filter drawer
  toggleFilters() {
    this.isFilterOpen.set(!this.isFilterOpen());
  }
}
