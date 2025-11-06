import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Footer } from './shared/footer/footer';
import { Header } from './shared/header/header';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, NgIf],
  template: `
    <app-header *ngIf="showPublicLayout()" />
    <main>
      <router-outlet />
    </main>
    <app-footer *ngIf="showPublicLayout()" />
  `,
  styles: [],
})
export class App {
  private router = inject(Router);

  // Observe router events to get the current URL
  private currentUrl = toSignal(this.router.events.pipe(filter((e) => e instanceof NavigationEnd)));

  // Computed signal to determine if the public layout should be shown
  protected showPublicLayout = computed(() => !this.currentUrl()?.url.startsWith('/adm'));
}
