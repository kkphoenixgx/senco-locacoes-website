import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-default-button',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './default-button.html',
  styleUrl: './default-button.scss',
})
export class DefaultButton {
  @Input() text = 'Clique Aqui';
  @Input() styleType: 'primary' | 'secondary' = 'primary';
  @Input() routerLink: string | any[] | null | undefined;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() isLoading = false;
  @Input() fullWidth = false;

  get isLink(): boolean {
    return !!this.routerLink;
  }
}
