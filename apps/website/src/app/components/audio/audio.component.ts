import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
})
export class AudioComponent {
  @Input() src: string | undefined;
  @Input() type = 'audio/mpeg';
}
