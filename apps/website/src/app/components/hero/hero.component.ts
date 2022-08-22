import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent {
  @Input() title: string | undefined;
  @Input() text: string | undefined;
}
