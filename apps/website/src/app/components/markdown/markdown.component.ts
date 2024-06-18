import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownComponent as NgxMarkdownComponent} from 'ngx-markdown';

@Component({
  selector: 'app-markdown',
  standalone: true,
  imports: [CommonModule, NgxMarkdownComponent],
  templateUrl: './markdown.component.html',
  styleUrl: './markdown.component.scss',
  preserveWhitespaces: true
})
export class MarkdownComponent {
  @Input() pathToMarkdownFile: string | null | undefined;
}
