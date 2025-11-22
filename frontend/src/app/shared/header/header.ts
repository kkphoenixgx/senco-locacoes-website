import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DefaultButton } from '../../components/default-button/default-button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, DefaultButton],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  public authService = inject(AuthService);
  private router = inject(Router);
  public isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  logout() {
    this.authService.logout();
  }
}
