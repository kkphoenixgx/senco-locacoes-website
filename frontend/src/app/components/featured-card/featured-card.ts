import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DefaultButton } from '../default-button/default-button';
import { NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'app-featured-card',
  standalone: true,
  imports: [RouterLink, DefaultButton, NgIf, NgStyle],
  templateUrl: './featured-card.html',
  styleUrl: './featured-card.scss',
})
export class FeaturedCard {
  @Input() title?: string;
  @Input() buttonText?: string;
  @Input() routerLink?: string;
  @Input() backgroundImageUrl?: string;
}
