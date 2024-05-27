import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HorizontalNavigationBarComponent
} from '../../navigation-bar/horizontal-navigation-bar/horizontal-navigation-bar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-logged-in-layout',
  standalone: true,
  imports: [CommonModule, HorizontalNavigationBarComponent, RouterOutlet],
  templateUrl: './logged-in-layout.component.html',
  styleUrl: './logged-in-layout.component.scss',
})
export class LoggedInLayoutComponent {}
