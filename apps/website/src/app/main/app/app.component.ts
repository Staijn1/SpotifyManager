import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationBarComponent } from '../navigation-bar/navigation-bar.component';
import { MessageService } from '../../services/message/message.service';
import { ToastComponent } from '../../components/toast/toast.component';
import * as AOS from 'aos';

@Component({
  standalone: true,
  imports: [RouterOutlet, NavigationBarComponent, ToastComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(protected readonly messageService: MessageService) {
  }

  /**
   * Initialize AOS on page load
   */
  ngOnInit(): void {
    AOS.init();
  }
}
