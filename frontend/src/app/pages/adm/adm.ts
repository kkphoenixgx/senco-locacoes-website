import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-adm',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './adm.html',
  styleUrl: './adm.scss',
})
export class Adm {
  private router = inject(Router);

  logout() {
    // Remove the token from storage and redirect to the login page
    localStorage.removeItem('admin-token');
    this.router.navigate(['/adm/login']);
  }
}
