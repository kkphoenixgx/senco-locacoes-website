import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-adm',
  imports: [RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './adm.html',
  styleUrl: './adm.scss',
})
export class Adm {
  private router = inject(Router);
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
    this.router.navigate(['/adm/login']);
  }
}
