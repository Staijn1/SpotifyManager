import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownComponent } from '../../../components/markdown/markdown.component';
import { Router } from '@angular/router';
import {
  DocumentationNavigationBarComponent
} from '../../../main/navigation-bar/documentation-navigation-bar/documentation-navigation-bar.component';

@Component({
  selector: 'app-markdown-documentation',
  standalone: true,
  imports: [CommonModule, MarkdownComponent],
  templateUrl: './markdown-documentation.component.html',
  styleUrl: './markdown-documentation.component.scss'
})
export class MarkdownDocumentationComponent {
  markdownUrl: string | undefined;

  constructor(private route: Router) {
    const currentPath = this.route.url;
    this.markdownUrl = DocumentationNavigationBarComponent.GetMarkdownUrlForPath(currentPath);
  }
}
