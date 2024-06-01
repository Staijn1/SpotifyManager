import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { cssDisc, cssHome } from '@ng-icons/css.gg';
import { heroBookOpen } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-vertical-navigation-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon, RouterLinkActive],
  providers: [provideIcons({cssDisc, cssHome, heroBookOpen})],
  templateUrl: './logged-in-navigation-bar.component.html',
  styleUrl: './logged-in-navigation-bar.component.scss',
})
export class LoggedInNavigationBarComponent {}
