import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-header',
  // Adicionamos RouterLink para os links e NgClass para o menu mobile
  imports: [RouterLink, NgClass],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  // Sinal para controlar o estado do menu mobile (aberto/fechado)
  isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }
}
