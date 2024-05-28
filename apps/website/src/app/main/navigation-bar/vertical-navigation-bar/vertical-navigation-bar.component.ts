import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-vertical-navigation-bar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vertical-navigation-bar.component.html',
  styleUrl: './vertical-navigation-bar.component.scss',
})
export class VerticalNavigationBarComponent {}
