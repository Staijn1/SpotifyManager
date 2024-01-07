import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationBarComponent } from '../navigation-bar/navigation-bar.component';

@Component({
  standalone: true,
  imports: [RouterOutlet, NavigationBarComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
}
