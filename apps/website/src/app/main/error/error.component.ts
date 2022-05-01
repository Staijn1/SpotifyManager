import {Component, Input} from '@angular/core';
import {CustomError} from '../../types/CustomError';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {
  @Input() error: CustomError | undefined;

}
