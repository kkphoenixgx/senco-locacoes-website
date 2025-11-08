import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionSubheader } from '../../components/section-subheader/section-subheader';
import { DefaultButton } from '../../components/default-button/default-button';
import { ImageWidget } from '../../components/image-widget/image-widget';
import { SectionHeader } from '../../components/section-header/section-header';


@Component({
  selector: 'app-about',
  imports: [RouterLink, SectionSubheader, DefaultButton, ImageWidget, SectionHeader],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {}
