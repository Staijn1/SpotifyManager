import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-inner-page',
  templateUrl: './inner-page.component.html',
  styleUrls: ['./inner-page.component.scss']
})
export class InnerPageComponent {
  @Input() title: string;

  constructor() {
  }
}
