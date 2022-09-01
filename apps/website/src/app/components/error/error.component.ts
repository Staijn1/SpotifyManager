import {Component, Input, ViewChild} from '@angular/core';
import {CustomError} from '../../types/CustomError';
import {NgbAlert} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {
  @ViewChild('staticAlert', {static: false}) staticAlert!: NgbAlert;

  /**
   * Setter for error
   * When called the alert will be shown and closed after 5 seconds
   * @param {CustomError | undefined} val
   */
  @Input() set error(val: CustomError | undefined) {
    this._error = val;
    console.log(this.staticAlert)
    if (this.staticAlert) {
      setTimeout(() => {
        this.staticAlert.close()
      }, 5000);
    }
  }

  _error: CustomError | undefined

}
