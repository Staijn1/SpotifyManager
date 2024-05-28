import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { cssDisc, cssHome } from '@ng-icons/css.gg';
import { heroBookOpen } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-vertical-navigation-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon],
  providers: [provideIcons({cssDisc, cssHome, heroBookOpen})],
  templateUrl: './vertical-navigation-bar.component.html',
  styleUrl: './vertical-navigation-bar.component.scss',
})
export class VerticalNavigationBarComponent {}
