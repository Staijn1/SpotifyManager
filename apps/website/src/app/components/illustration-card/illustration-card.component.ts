import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-illustration-card',
  templateUrl: './illustration-card.component.html',
  styleUrls: ['./illustration-card.component.scss'],
})
export class IllustrationCardComponent {
  @Input() title = '';
  @Input() text = '';
}
