import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HorizontalNavigationBarComponent
} from '../../navigation-bar/horizontal-navigation-bar/horizontal-navigation-bar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-regular-layout',
  standalone: true,
  imports: [CommonModule, HorizontalNavigationBarComponent, RouterOutlet],
  templateUrl: './regular-layout.component.html',
  styleUrl: './regular-layout.component.scss',
})
export class RegularLayoutComponent {}
