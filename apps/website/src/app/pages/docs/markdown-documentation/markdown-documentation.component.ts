import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownComponent } from '../../../components/markdown/markdown.component';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-markdown-documentation',
  standalone: true,
  imports: [CommonModule, MarkdownComponent],
  templateUrl: './markdown-documentation.component.html',
  styleUrl: './markdown-documentation.component.scss',
})
export class MarkdownDocumentationComponent {
  markdownUrl: string | null | undefined;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        console.log(this.router.getCurrentNavigation()?.extras.state?.['markdownUrl']);
        this.markdownUrl = this.router.getCurrentNavigation()?.extras.state?.['markdownUrl'];
      }
    });
  }
}
