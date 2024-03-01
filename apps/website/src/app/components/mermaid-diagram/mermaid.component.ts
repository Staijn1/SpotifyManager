import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as mermaid from 'mermaid';

@Component({
  selector: 'app-mermaid',
  standalone: true,
  templateUrl: './mermaid.component.html',
  styleUrl: './mermaid.component.scss'
})
export class MermaidComponent implements OnInit {
  @ViewChild('outputDiv') outputDiv!: ElementRef<HTMLDivElement>;
  private _rawCode = '';

  @Input()
  set rawCode(value: string) {
    this._rawCode = value;
    this.renderMermaid(this._rawCode);
  }

  get rawCode(): string {
    return this._rawCode;
  }

  ngOnInit() {
    mermaid.default.mermaidAPI.initialize({
      startOnLoad: true
    });
  }

  renderMermaid(rawCode: string) {
    mermaid.default.mermaidAPI
      .render('diagram', rawCode)
      .then(result => this.outputDiv.nativeElement.innerHTML = result.svg);
  }
}
