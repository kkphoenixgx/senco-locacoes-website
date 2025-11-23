import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DefaultButton } from '../../components/default-button/default-button';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, DefaultButton, MatIconModule, MatTooltipModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Sinal computado local que reage às mudanças do serviço de autenticação.
  public authState = computed(() => this.authService.authState());
  public isMenuOpen = signal(false);

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  logout() {
    this.authService.logout();
  }
}
